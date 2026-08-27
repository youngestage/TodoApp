import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { DebtAccount, SavingsGoal } from '../../../types';

interface DebtAndSavingsProgressProps {
  currency: string;
  debtAccounts: DebtAccount[];
  savingsGoals: SavingsGoal[];
  totalSavedAcrossGoals: number;
}

export const DebtAndSavingsProgress: React.FC<DebtAndSavingsProgressProps> = ({
  currency,
  debtAccounts,
  savingsGoals,
  totalSavedAcrossGoals
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Debt Payoff Progress */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-4 border-0 shadow-none">
        <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#8964B3]" />
            <h3 className="font-bold text-base text-[#231F1E]">Debt Payoff Strategy</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#8964B3]">
            {debtAccounts.length} Debt Accounts
          </span>
        </div>

        {debtAccounts.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6B6560]">
            No active debt accounts added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {debtAccounts.map((debt) => {
              const totalOriginal = debt.principalAmount || (debt.balance + 1000);
              const paidOff = Math.max(0, totalOriginal - debt.balance);
              const pct = totalOriginal > 0 ? Math.min(100, Math.round((paidOff / totalOriginal) * 100)) : 0;

              return (
                <div key={debt.id} className="p-4 rounded-2xl bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#231F1E]">{debt.name}</span>
                    <span className="font-mono text-xs font-bold text-[#8964B3]">
                      {currency}{debt.balance.toLocaleString()} remaining
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#E5E0D8] overflow-hidden">
                    <div className="h-full bg-[#8964B3] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#6B6560]">
                    <span>{pct}% Paid Off</span>
                    <span>Min Pay: {currency}{debt.minimumPayment.toLocaleString()}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings Goals Growth Progress */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-4 border-0 shadow-none">
        <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-[#4A7C59]" />
            <h3 className="font-bold text-base text-[#231F1E]">Savings Goals Progress</h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#4A7C59]">
            Total: {currency}{totalSavedAcrossGoals.toLocaleString()}
          </span>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6B6560]">
            No active savings goals set up yet.
          </div>
        ) : (
          <div className="space-y-3">
            {savingsGoals.map((goal) => {
              const target = goal.targetAmount || 1;
              const current = goal.currentAmount || 0;
              const pct = Math.min(100, Math.round((current / target) * 100));

              return (
                <div key={goal.id} className="p-4 rounded-2xl bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#231F1E]">{goal.name}</span>
                    <span className="font-mono text-xs font-bold text-[#4A7C59]">
                      {currency}{current.toLocaleString()} / {currency}{target.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#E5E0D8] overflow-hidden">
                    <div className="h-full bg-[#4A7C59] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#6B6560]">
                    <span>{pct}% Achieved</span>
                    <span>Cadence: {goal.cadence}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
