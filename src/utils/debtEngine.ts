import { DebtAccount, DebtRateType } from '../types';

/**
 * Calculates the true effective Annual Percentage Rate (APR) based on quoted rate and rate type.
 * Addresses Nigerian lending nuances (e.g. 5% flat monthly vs 0.075% daily vs 2.5% reducing).
 */
export function calculateEffectiveAPR(interestRate: number, rateType: DebtRateType): number {
  if (!interestRate || interestRate <= 0 || rateType === 'zero_interest') {
    return 0;
  }

  switch (rateType) {
    case 'daily_rate':
      // Quoted daily rate (e.g. Kuda 0.075%/day) -> 0.075 * 365 = 27.375%
      return parseFloat((interestRate * 365).toFixed(2));

    case 'flat_monthly':
      // Flat monthly interest on original principal: 5% monthly flat equates to ~60% nominal APR
      // Effective APR on amortized flat rate is approximately rate * 12
      return parseFloat((interestRate * 12).toFixed(2));

    case 'reducing_balance':
      // Reducing balance monthly rate: e.g. 2.5% monthly = 30% APR
      return parseFloat((interestRate * 12).toFixed(2));

    default:
      return parseFloat((interestRate * 12).toFixed(2));
  }
}

export interface PayoffSimulationResult {
  strategy: 'Avalanche' | 'Snowball' | 'Minimum';
  monthsToFreedom: number;
  payoffDateStr: string;
  totalInterestPaid: number;
  totalPaid: number;
  debtsTimeline: {
    debtId: string;
    debtName: string;
    eliminatedInMonth: number;
    eliminatedDateStr: string;
  }[];
}

/**
 * Simulates month-by-month debt payoff under Avalanche (highest APR first) vs. Snowball (lowest balance first).
 */
export function simulatePayoffStrategy(
  debts: DebtAccount[],
  extraMonthlyContribution: number = 0,
  strategy: 'Avalanche' | 'Snowball' | 'Minimum' = 'Avalanche'
): PayoffSimulationResult {
  const activeDebts = debts
    .filter((d) => d.status !== 'PAID_OFF' && d.balance > 0)
    .map((d) => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      apr: d.effectiveAPR || calculateEffectiveAPR(d.interestRate, d.rateType),
      minPayment: d.minimumPayment || Math.max(1000, Math.round(d.balance * 0.05))
    }));

  if (activeDebts.length === 0) {
    return {
      strategy,
      monthsToFreedom: 0,
      payoffDateStr: 'All debts cleared! 🎉',
      totalInterestPaid: 0,
      totalPaid: 0,
      debtsTimeline: []
    };
  }

  // Sort according to strategy priority
  const sortedDebts = [...activeDebts].sort((a, b) => {
    if (strategy === 'Avalanche') return b.apr - a.apr; // Highest APR first
    if (strategy === 'Snowball') return a.balance - b.balance; // Lowest balance first
    return 0;
  });

  let currentMonth = 0;
  let totalInterestAccrued = 0;
  let totalPaidOverall = 0;
  const debtsTimeline: PayoffSimulationResult['debtsTimeline'] = [];
  const currentDate = new Date();

  // Max cap 360 months (30 years) to prevent infinite loops
  while (sortedDebts.some((d) => d.balance > 0) && currentMonth < 360) {
    currentMonth++;
    let monthlyExtraPool = extraMonthlyContribution;

    // 1. Accrue monthly interest & pay minimums across all debts
    for (const debt of sortedDebts) {
      if (debt.balance <= 0) continue;

      const monthlyRate = debt.apr / 100 / 12;
      const interestThisMonth = debt.balance * monthlyRate;
      debt.balance += interestThisMonth;
      totalInterestAccrued += interestThisMonth;

      // Minimum payment
      const paymentAmount = Math.min(debt.balance, debt.minPayment);
      debt.balance -= paymentAmount;
      totalPaidOverall += paymentAmount;

      if (debt.balance <= 0) {
        debt.balance = 0;
        const targetDate = new Date(currentDate);
        targetDate.setMonth(targetDate.getMonth() + currentMonth);
        debtsTimeline.push({
          debtId: debt.id,
          debtName: debt.name,
          eliminatedInMonth: currentMonth,
          eliminatedDateStr: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
      }
    }

    // 2. Apply extra monthly contribution pool to the highest priority active debt
    for (const debt of sortedDebts) {
      if (debt.balance <= 0 || monthlyExtraPool <= 0) continue;

      const extraPayment = Math.min(debt.balance, monthlyExtraPool);
      debt.balance -= extraPayment;
      monthlyExtraPool -= extraPayment;
      totalPaidOverall += extraPayment;

      if (debt.balance <= 0) {
        debt.balance = 0;
        // Avoid duplicate entry if cleared in same month
        if (!debtsTimeline.some((t) => t.debtId === debt.id)) {
          const targetDate = new Date(currentDate);
          targetDate.setMonth(targetDate.getMonth() + currentMonth);
          debtsTimeline.push({
            debtId: debt.id,
            debtName: debt.name,
            eliminatedInMonth: currentMonth,
            eliminatedDateStr: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          });
        }
      }
    }
  }

  const finalDate = new Date(currentDate);
  finalDate.setMonth(finalDate.getMonth() + currentMonth);

  return {
    strategy,
    monthsToFreedom: currentMonth,
    payoffDateStr: finalDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    totalInterestPaid: Math.round(totalInterestAccrued),
    totalPaid: Math.round(totalPaidOverall),
    debtsTimeline
  };
}
