import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { CalendarHeaderFilters, DateFilterPreset } from './calendar/CalendarHeaderFilters';
import { FinanceKpiCards } from './calendar/FinanceKpiCards';
import { MonthlyCalendarGrid } from './calendar/MonthlyCalendarGrid';
import { FinanceChartsSection } from './calendar/FinanceChartsSection';
import { DebtAndSavingsProgress } from './calendar/DebtAndSavingsProgress';
import { DayDetailModal } from './calendar/DayDetailModal';

const CATEGORY_COLORS: Record<string, string> = {
  'Groceries & Market': '#EF713F',
  'Dining & Takeout': '#F4A261',
  'Fuel & Transport': '#2A9D8F',
  'Shopping & Fashion': '#E76F51',
  'Home Care & Maintenance': '#457B9D',
  'Entertainment & Leisure': '#9B5DE5',
  'Health & Wellness': '#06D6A0',
  'Bills & Subscriptions': '#8964B3',
  'Debt Payment': '#E63946',
  'Savings Contribution': '#4A7C59',
  'Other Expense': '#6B6560'
};

const DEFAULT_CHART_COLORS = ['#EF713F', '#4A7C59', '#2A9D8F', '#E76F51', '#8964B3', '#F4A261', '#457B9D', '#E63946'];

export const FinanceCalendarSection: React.FC = () => {
  const {
    transactions,
    recurringBills,
    debtAccounts,
    savingsGoals,
    preferences
  } = useStore();

  const currency = preferences?.currency || '₦';

  // 1. Filter State
  const [preset, setPreset] = useState<DateFilterPreset>('1M');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Calendar View Month Navigation State
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Selected Day Modal State
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // Compute Active Date Boundaries
  const dateRange = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    if (preset === '1M') {
      start.setDate(1); // Start of current month
    } else if (preset === '2M') {
      start.setMonth(start.getMonth() - 1, 1);
    } else if (preset === '3M') {
      start.setMonth(start.getMonth() - 2, 1);
    } else if (preset === '6M') {
      start.setMonth(start.getMonth() - 5, 1);
    } else if (preset === '1Y') {
      start.setMonth(0, 1);
    } else if (preset === 'CUSTOM') {
      if (customStartDate) start = new Date(customStartDate + 'T00:00:00');
      if (customEndDate) {
        const customEnd = new Date(customEndDate + 'T23:59:59');
        return { start, end: customEnd };
      }
    }

    return { start, end };
  }, [preset, customStartDate, customEndDate]);

  // Helper date parsing
  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d >= dateRange.start && d <= dateRange.end;
  };

  // Filtered Datasets based on Date Range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => isDateInRange(tx.date || (tx as any).created_at));
  }, [transactions, dateRange]);

  const filteredDebtPayments = useMemo(() => {
    const list: Array<{ payment: any; debtName: string }> = [];
    debtAccounts.forEach((d) => {
      (d.payments || []).forEach((p) => {
        if (isDateInRange(p.paymentDate || p.createdAt)) {
          list.push({ payment: p, debtName: d.name });
        }
      });
    });
    return list;
  }, [debtAccounts, dateRange]);

  const filteredSavingsContributions = useMemo(() => {
    const list: Array<{ contribution: any; goalName: string }> = [];
    savingsGoals.forEach((g) => {
      (g.contributions || []).forEach((c) => {
        if (isDateInRange(c.contributionDate || c.createdAt)) {
          list.push({ contribution: c, goalName: g.name });
        }
      });
    });
    return list;
  }, [savingsGoals, dateRange]);

  // Compute Financial Aggregates
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalDebtPaidInPeriod = useMemo(() => {
    return filteredDebtPayments.reduce((sum, p) => sum + Number(p.payment.amount || 0), 0);
  }, [filteredDebtPayments]);

  const totalSavingsInPeriod = useMemo(() => {
    return filteredSavingsContributions.reduce((sum, c) => sum + Number(c.contribution.amount || 0), 0);
  }, [filteredSavingsContributions]);

  const netSurplus = totalIncome - totalExpense;

  const totalRemainingDebt = useMemo(() => {
    return debtAccounts
      .filter((d) => d.status === 'ACTIVE')
      .reduce((sum, d) => sum + Number(d.balance || 0), 0);
  }, [debtAccounts]);

  const totalSavedAcrossGoals = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
  }, [savingsGoals]);

  // Expense Category Breakdown Data for Pie Chart
  const categoryBreakdownData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredTransactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const cat = t.category || 'Other Expense';
        counts[cat] = (counts[cat] || 0) + Number(t.amount || 0);
      });

    if (totalDebtPaidInPeriod > 0) {
      counts['Debt Payment'] = (counts['Debt Payment'] || 0) + totalDebtPaidInPeriod;
    }

    if (totalSavingsInPeriod > 0) {
      counts['Savings Contribution'] = (counts['Savings Contribution'] || 0) + totalSavingsInPeriod;
    }

    const data = Object.keys(counts).map((cat, idx) => ({
      name: cat,
      value: counts[cat],
      color: CATEGORY_COLORS[cat] || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]
    }));

    return data.sort((a, b) => b.value - a.value);
  }, [filteredTransactions, totalDebtPaidInPeriod, totalSavingsInPeriod]);

  // Cash Flow Bar Chart Data (Monthly Aggregates)
  const cashFlowTrendData = useMemo(() => {
    const monthlyMap: Record<string, { monthKey: string; monthLabel: string; income: number; expense: number }> = {};

    const cur = new Date(dateRange.start);
    cur.setDate(1);
    while (cur <= dateRange.end) {
      const monthKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = cur.toLocaleDateString([], { month: 'short', year: '2-digit' });
      monthlyMap[monthKey] = { monthKey, monthLabel, income: 0, expense: 0 };
      cur.setMonth(cur.getMonth() + 1);
    }

    filteredTransactions.forEach((tx) => {
      const txDate = new Date(tx.date || (tx as any).created_at);
      if (!isNaN(txDate.getTime())) {
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[monthKey]) {
          if (tx.type === 'INCOME') monthlyMap[monthKey].income += Number(tx.amount || 0);
          else monthlyMap[monthKey].expense += Number(tx.amount || 0);
        }
      }
    });

    return Object.values(monthlyMap);
  }, [dateRange, filteredTransactions]);

  // Calendar Days Calculation for the Active Month Navigation
  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum,
        isCurrentMonth: false
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      days.push({
        dateStr: curDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: true
      });
    }

    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let n = 1; n <= remaining; n++) {
      const nextDate = new Date(year, month + 1, n);
      days.push({
        dateStr: nextDate.toISOString().split('T')[0],
        dayNum: n,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentCalendarDate]);

  // Map calendar date string -> items (transactions, bills due, debt payments, savings contributions)
  const itemsByDateStr = useMemo(() => {
    const map: Record<
      string,
      {
        incomes: number;
        expenses: number;
        items: Array<{ id: string; title: string; amount: number; type: 'income' | 'expense' | 'bill' | 'debt' | 'savings'; subtitle?: string }>;
      }
    > = {};

    const addEntry = (dateStr: string, item: { id: string; title: string; amount: number; type: 'income' | 'expense' | 'bill' | 'debt' | 'savings'; subtitle?: string }) => {
      if (!map[dateStr]) map[dateStr] = { incomes: 0, expenses: 0, items: [] };
      map[dateStr].items.push(item);
      if (item.type === 'income') map[dateStr].incomes += item.amount;
      else if (item.type === 'expense' || item.type === 'bill' || item.type === 'debt') map[dateStr].expenses += item.amount;
    };

    transactions.forEach((tx) => {
      const dStr = new Date(tx.date || (tx as any).created_at).toISOString().split('T')[0];
      addEntry(dStr, {
        id: tx.id,
        title: tx.title,
        amount: Number(tx.amount || 0),
        type: tx.type === 'INCOME' ? 'income' : 'expense',
        subtitle: `Paid by ${tx.paidBy}`
      });
    });

    recurringBills.forEach((b) => {
      if (b.nextDueDate) {
        addEntry(b.nextDueDate, {
          id: b.id,
          title: `Bill Due: ${b.title}`,
          amount: Number(b.amount || 0),
          type: 'bill',
          subtitle: `Status: ${b.status}`
        });
      }
    });

    debtAccounts.forEach((d) => {
      (d.payments || []).forEach((p) => {
        if (p.paymentDate) {
          addEntry(p.paymentDate, {
            id: p.id,
            title: `Debt Paid: ${d.name}`,
            amount: Number(p.amount || 0),
            type: 'debt',
            subtitle: `Principal: ${currency}${p.principalPaid.toLocaleString()}`
          });
        }
      });
    });

    savingsGoals.forEach((g) => {
      (g.contributions || []).forEach((c) => {
        if (c.contributionDate) {
          addEntry(c.contributionDate, {
            id: c.id,
            title: `Savings Deposit: ${g.name}`,
            amount: Number(c.amount || 0),
            type: 'savings',
            subtitle: `By ${c.contributorName}`
          });
        }
      });
    });

    return map;
  }, [transactions, recurringBills, debtAccounts, savingsGoals, currency]);

  const selectedDayData = selectedDayStr ? itemsByDateStr[selectedDayStr] : null;

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header & Filters */}
      <CalendarHeaderFilters
        preset={preset}
        setPreset={setPreset}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
      />

      {/* 2. Key Performance Indicators */}
      <FinanceKpiCards
        currency={currency}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSurplus={netSurplus}
        totalDebtPaidInPeriod={totalDebtPaidInPeriod}
        totalRemainingDebt={totalRemainingDebt}
      />

      {/* 3. Monthly Calendar Grid */}
      <MonthlyCalendarGrid
        currentCalendarDate={currentCalendarDate}
        setCurrentCalendarDate={setCurrentCalendarDate}
        calendarDays={calendarDays}
        itemsByDateStr={itemsByDateStr}
        currency={currency}
        onSelectDay={(dateStr) => setSelectedDayStr(dateStr)}
      />

      {/* 4. Charts: Category Breakdown & Cash Flow Trend */}
      <FinanceChartsSection
        currency={currency}
        categoryBreakdownData={categoryBreakdownData}
        cashFlowTrendData={cashFlowTrendData}
        totalExpense={totalExpense}
        totalDebtPaidInPeriod={totalDebtPaidInPeriod}
        totalSavingsInPeriod={totalSavingsInPeriod}
      />

      {/* 5. Debt Payoff & Savings Progress */}
      <DebtAndSavingsProgress
        currency={currency}
        debtAccounts={debtAccounts}
        savingsGoals={savingsGoals}
        totalSavedAcrossGoals={totalSavedAcrossGoals}
      />

      {/* 6. Day Detail Modal */}
      <DayDetailModal
        selectedDayStr={selectedDayStr}
        onClose={() => setSelectedDayStr(null)}
        selectedDayData={selectedDayData}
        currency={currency}
      />
    </div>
  );
};
