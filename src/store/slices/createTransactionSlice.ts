import { StateCreator } from 'zustand';
import {
  Transaction,
  RecurringBill,
  DebtAccount,
  DebtPayment,
  SavingsGoal,
  SavingsContribution,
  IncomeStream,
  BudgetCategoryType,
  AppPreferences
} from '../../types';
import { calculateNextDueDate } from '../../utils/dateUtils';
import { sendBackgroundPushToPartner } from '../../utils/notifications';
import { calculateEffectiveAPR } from '../../utils/debtEngine';
import { calculateRequiredContribution } from '../../utils/savingsEngine';
import { StoreState } from '../useStore';
import {
  saveRecurringBillToDB,
  updateRecurringBillInDB,
  deleteRecurringBillFromDB,
  saveDebtAccountToDB,
  updateDebtAccountInDB,
  deleteDebtAccountFromDB,
  logDebtPaymentInDB,
  saveSavingsGoalToDB,
  updateSavingsGoalInDB,
  deleteSavingsGoalFromDB,
  logSavingsContributionInDB,
  saveTransactionToDB,
  updateTransactionInDB,
  deleteTransactionFromDB,
  saveIncomeStreamToDB,
  updateIncomeStreamInDB,
  deleteIncomeStreamFromDB,
  deleteContextualCommentsByTargetInDB
} from '../../services';

export interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  settleUpBalance: () => void;
  
  recurringBills: RecurringBill[];
  addRecurringBill: (bill: Omit<RecurringBill, 'id'>) => void;
  updateRecurringBill: (id: string, updates: Partial<RecurringBill>) => void;
  deleteRecurringBill: (id: string) => void;
  togglePauseBill: (id: string) => void;
  payRecurringBill: (id: string) => void;

  // Preferences & Accounts
  hideBalances: boolean;
  toggleHideBalances: () => void;
  preferences: AppPreferences;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;

  subcategories: Record<BudgetCategoryType, string[]>;
  addSubcategory: (category: BudgetCategoryType, name: string) => boolean;
  deleteSubcategory: (category: BudgetCategoryType, name: string) => void;

  paymentAccounts: string[];
  addPaymentAccount: (account: string) => boolean;
  deletePaymentAccount: (account: string) => void;

  debtAccounts: DebtAccount[];
  debtStrategy: 'Avalanche' | 'Snowball' | 'Minimum';
  extraDebtContribution: number;
  updateDebtConfig: (strategy: 'Avalanche' | 'Snowball' | 'Minimum', extra: number) => void;
  addDebtAccount: (debt: Omit<DebtAccount, 'id' | 'effectiveAPR' | 'status'>) => void;
  updateDebtAccount: (id: string, updates: Partial<DebtAccount>) => void;
  deleteDebtAccount: (id: string) => void;
  logDebtPayment: (payment: { debtId: string; amount: number; paidBy?: string }) => void;

  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'status'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  archiveSavingsGoal: (id: string) => void;
  logSavingsContribution: (contribution: { goalId: string; amount: number; contributorName?: string; note?: string }) => void;

  incomeStreams: IncomeStream[];
  addIncomeStream: (stream: Omit<IncomeStream, 'id'>) => void;
  updateIncomeStream: (id: string, updates: Partial<IncomeStream>) => void;
  deleteIncomeStream: (id: string) => void;
  logIncomePayout: (id: string) => void;
}

export const defaultPreferences: AppPreferences = {
  currency: '₦',
  budgetYear: 2026,
  firstDayOfWeek: 'Monday'
};

export const defaultSubcategories: Record<BudgetCategoryType, string[]> = {
  Income: ['Salary', 'Freelance Payout', 'Dividends', 'Gift Income', 'Business Revenue'],
  Expenses: [
    'Groceries & Market',
    'Dining & Takeout',
    'Fuel & Transport',
    'Shopping & Fashion',
    'Home Care & Maintenance',
    'Entertainment & Leisure',
    'Health & Wellness',
    'Family & Kids',
    'Personal Care',
    'Other Expense'
  ],
  Bills: [],
  Savings: [],
  Investments: [],
  Debt: []
};

export const defaultPaymentAccounts = [
  'Opay (Partner A)',
  'Kuda (Partner B)',
  'GTBank',
  'PiggyVest',
  'Joint Account'
];

export const defaultRecurringBills: RecurringBill[] = [
  {
    id: 'b-1',
    title: 'Fibre Internet Unlimited',
    category: 'Bills',
    amount: 25000,
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    paidBy: 'Shared',
    splitType: 'equal',
    paymentMethod: 'card',
    status: 'UPCOMING',
    autoLogTransaction: true
  },
  {
    id: 'b-2',
    title: 'Netflix Premium 4K',
    category: 'Bills',
    amount: 5500,
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    paidBy: 'Leslie',
    splitType: 'equal',
    paymentMethod: 'card',
    status: 'UPCOMING',
    autoLogTransaction: true
  },
  {
    id: 'b-3',
    title: 'Spotify Family Plan',
    category: 'Bills',
    amount: 3200,
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    paidBy: 'Asa',
    splitType: 'equal',
    paymentMethod: 'bank_transfer',
    status: 'UPCOMING',
    autoLogTransaction: true
  }
];

export const defaultDebtAccounts: DebtAccount[] = [
  {
    id: 'd-1',
    name: 'Carbon Emergency Loan',
    category: 'digital_app',
    lenderName: 'Carbon',
    principalAmount: 150000,
    balance: 120000,
    rateType: 'flat_monthly',
    interestRate: 5,
    effectiveAPR: 60,
    repaymentFrequency: 'monthly',
    repaymentMethod: 'bank_transfer',
    minimumPayment: 30000,
    nextDueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    paidBy: 'Leslie',
    status: 'ACTIVE',
    notes: 'Loan app short-term credit'
  },
  {
    id: 'd-2',
    name: 'GTBank QuickCredit',
    category: 'bank_loan',
    lenderName: 'GTBank',
    principalAmount: 300000,
    balance: 210000,
    rateType: 'flat_monthly',
    interestRate: 2.8,
    effectiveAPR: 33.6,
    repaymentFrequency: 'monthly',
    repaymentMethod: 'salary_deduction',
    minimumPayment: 25000,
    nextDueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paidBy: 'Asa',
    status: 'ACTIVE',
    notes: 'Salary advance bank loan'
  },
  {
    id: 'd-3',
    name: 'Ajo/Esusu Group Contribution',
    category: 'ajo_esusu',
    lenderName: 'Cooperative Ajo Group',
    principalAmount: 50000,
    balance: 35000,
    rateType: 'zero_interest',
    interestRate: 0,
    effectiveAPR: 0,
    repaymentFrequency: 'monthly',
    repaymentMethod: 'bank_transfer',
    minimumPayment: 15000,
    nextDueDate: new Date(Date.now() + 22 * 86400000).toISOString().split('T')[0],
    paidBy: 'Shared',
    status: 'ACTIVE',
    notes: 'Informal monthly rotating savings'
  }
];

export const defaultSavingsGoals: SavingsGoal[] = [
  {
    id: 'g-1',
    name: 'Japa Relocation & Tech Visa Fund',
    icon: '✈️',
    category: 'Japa',
    targetAmount: 5000000,
    currentAmount: 1850000,
    startingBalance: 500000,
    currency: '₦',
    targetDate: new Date(Date.now() + 240 * 86400000).toISOString().split('T')[0],
    cadence: 'monthly',
    suggestedContribution: 393750,
    ownership: 'joint',
    externalStorageNote: 'PiggyVest SafeLock @ 15% p.a.',
    status: 'ACTIVE',
    goalAmount: 5000000,
    monthlyContribution: 393750
  },
  {
    id: 'g-2',
    name: 'Wedding Ceremony & Reception',
    icon: '💍',
    category: 'Wedding',
    targetAmount: 3000000,
    currentAmount: 1450000,
    startingBalance: 200000,
    currency: '₦',
    targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    cadence: 'monthly',
    suggestedContribution: 258333,
    ownership: 'joint',
    externalStorageNote: 'Cowrywise Mutual Fund',
    status: 'ACTIVE',
    goalAmount: 3000000,
    monthlyContribution: 258333
  },
  {
    id: 'g-3',
    name: 'Household Emergency Umbrella Pot',
    icon: '☂️',
    category: 'Emergency',
    targetAmount: 1000000,
    currentAmount: 650000,
    startingBalance: 100000,
    currency: '₦',
    cadence: 'monthly',
    suggestedContribution: 50000,
    ownership: 'household',
    externalStorageNote: 'Kuda Target Savings',
    status: 'ACTIVE',
    goalAmount: 1000000,
    monthlyContribution: 50000
  }
];

export const defaultIncomeStreams: IncomeStream[] = [
  {
    id: 'inc-1',
    title: 'Senior Software Engineer Salary',
    category: 'Salary',
    amount: 1500000,
    currency: '₦',
    cadence: 'monthly',
    earnedBy: 'Leslie',
    notes: 'Main monthly salary payout',
    status: 'ACTIVE'
  },
  {
    id: 'inc-2',
    title: 'Product Design Freelance Contracts',
    category: 'Freelance',
    amount: 650000,
    currency: '₦',
    cadence: 'monthly',
    earnedBy: 'Asa',
    notes: 'Design client retainers',
    status: 'ACTIVE'
  },
  {
    id: 'inc-3',
    title: 'E-commerce Store Dividends',
    category: 'Business',
    amount: 350000,
    currency: '₦',
    cadence: 'monthly',
    earnedBy: 'Joint',
    notes: 'Joint business side hustle',
    status: 'ACTIVE'
  }
];

export const createTransactionSlice: StateCreator<StoreState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  recurringBills: [],
  debtAccounts: [],
  debtStrategy: 'Avalanche',
  extraDebtContribution: 0,
  savingsGoals: [],
  incomeStreams: [],

  hideBalances: false,
  toggleHideBalances: () => set((state: StoreState) => ({ hideBalances: !state.hideBalances })),

  preferences: defaultPreferences,
  updatePreferences: (prefs) => set((state: StoreState) => ({
    preferences: { ...state.preferences, ...prefs }
  })),

  subcategories: defaultSubcategories,
  addSubcategory: (category, name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const current = get().subcategories[category] || [];
    if (current.includes(trimmed) || current.length >= 20) return false;
    set((state: StoreState) => ({
      subcategories: {
        ...state.subcategories,
        [category]: [...current, trimmed]
      }
    }));
    return true;
  },

  deleteSubcategory: (category, name) => set((state: StoreState) => ({
    subcategories: {
      ...state.subcategories,
      [category]: (state.subcategories[category] || []).filter((item: string) => item !== name)
    }
  })),

  paymentAccounts: defaultPaymentAccounts,
  addPaymentAccount: (account) => {
    const trimmed = account.trim();
    if (!trimmed) return false;
    const current = get().paymentAccounts;
    if (current.includes(trimmed) || current.length >= 10) return false;
    set({ paymentAccounts: [...current, trimmed] });
    return true;
  },

  deletePaymentAccount: (account) => set((state: StoreState) => ({
    paymentAccounts: state.paymentAccounts.filter((a: string) => a !== account)
  })),

  updateDebtConfig: (strategy, extra) => set({ debtStrategy: strategy, extraDebtContribution: extra }),

  // TRANSACTIONS CRUD
  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      commentsCount: 0
    };

    set((state: StoreState) => ({ transactions: [newTx, ...state.transactions] }));

    const householdId = get().household?.id;
    const currentUserId = get().currentUser?.id;
    if (householdId) {
      saveTransactionToDB(newTx, householdId);
      if (currentUserId) {
        const typeLabel = tx.type === 'EXPENSE' ? 'expense' : 'income';
        sendBackgroundPushToPartner(
          householdId,
          currentUserId,
          'New Transaction Logged 💰',
          `${tx.paidBy} logged ${typeLabel}: ${tx.title} (${get().preferences.currency}${tx.amount})`,
          '/'
        );
      }
    }
  },

  updateTransaction: (id, updates) => {
    set((state: StoreState) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }));
    updateTransactionInDB(id, updates);
  },

  deleteTransaction: (id) => {
    set((state: StoreState) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      contextualComments: state.contextualComments.filter((c) => c.targetId !== id),
      chatMessages: state.chatMessages.filter((m) => m.attachment?.id !== id)
    }));
    deleteTransactionFromDB(id);
    deleteContextualCommentsByTargetInDB(id);
  },

  settleUpBalance: () => set((state: StoreState) => ({
    household: {
      ...state.household,
      settleBalance: {
        ...state.household.settleBalance,
        amount: 0
      }
    }
  })),

  // RECURRING BILLS CRUD
  addRecurringBill: (bill) => {
    const newBill: RecurringBill = {
      ...bill,
      id: crypto.randomUUID(),
      status: 'UPCOMING',
      autoLogTransaction: bill.autoLogTransaction ?? true,
      dueDate: bill.nextDueDate
    };

    set((state: StoreState) => ({
      recurringBills: [newBill, ...state.recurringBills]
    }));

    const householdId = get().household?.id;
    if (householdId) saveRecurringBillToDB(newBill, householdId);
  },

  updateRecurringBill: (id, updates) => {
    set((state: StoreState) => ({
      recurringBills: state.recurringBills.map((b) =>
        b.id === id ? { ...b, ...updates, dueDate: updates.nextDueDate || b.nextDueDate } : b
      )
    }));
    updateRecurringBillInDB(id, updates);
  },

  deleteRecurringBill: (id) => {
    set((state: StoreState) => ({
      recurringBills: state.recurringBills.filter((b) => b.id !== id),
      contextualComments: state.contextualComments.filter((c) => c.targetId !== id),
      chatMessages: state.chatMessages.filter((m) => m.attachment?.id !== id)
    }));
    deleteRecurringBillFromDB(id);
    deleteContextualCommentsByTargetInDB(id);
  },

  togglePauseBill: (id) => {
    const current = get().recurringBills.find(b => b.id === id);
    if (!current) return;
    const newStatus = current.status === 'PAUSED' ? 'UPCOMING' : 'PAUSED';

    set((state: StoreState) => ({
      recurringBills: state.recurringBills.map((b) =>
        b.id === id ? { ...b, status: newStatus } : b
      )
    }));
    updateRecurringBillInDB(id, { status: newStatus });
  },

  payRecurringBill: (id) => {
    const current = get().recurringBills.find(b => b.id === id);
    if (!current) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const computedNextDueDate = calculateNextDueDate(
      current.nextDueDate || todayStr,
      current.frequency,
      current.customIntervalDays
    );

    if (current.autoLogTransaction !== false) {
      const currentUserName = get().currentUser?.name || 'Leslie';
      const paidByTarget = current.paidBy === 'Shared' 
        ? (currentUserName === 'Asa' ? 'Asa' : 'Leslie') 
        : (current.paidBy as 'Leslie' | 'Asa');

      get().addTransaction({
        title: `Recurring: ${current.title}`,
        amount: current.amount,
        type: 'EXPENSE',
        category: 'Expenses',
        paidBy: paidByTarget,
        account: current.paymentMethod ? `Card (${current.paymentMethod})` : 'Joint Account',
        isShared: current.paidBy === 'Shared',
        date: 'Just now'
      });
    }

    const updates: Partial<RecurringBill> = {
      status: 'PAID',
      nextDueDate: computedNextDueDate,
      dueDate: computedNextDueDate,
      lastPaidDate: todayStr
    };

    set((state: StoreState) => ({
      recurringBills: state.recurringBills.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      )
    }));

    updateRecurringBillInDB(id, updates);
  },

  // DEBT ACTIONS
  addDebtAccount: (debtInput) => {
    const computedAPR = calculateEffectiveAPR(debtInput.interestRate, debtInput.rateType);
    const newDebt: DebtAccount = {
      ...debtInput,
      id: crypto.randomUUID(),
      effectiveAPR: computedAPR,
      status: 'ACTIVE',
      dueDate: debtInput.nextDueDate
    };

    set((state: StoreState) => ({
      debtAccounts: [newDebt, ...state.debtAccounts]
    }));

    const householdId = get().household?.id;
    if (householdId) saveDebtAccountToDB(newDebt, householdId);
  },

  updateDebtAccount: (id, updates) => {
    set((state: StoreState) => ({
      debtAccounts: state.debtAccounts.map((d) => {
        if (d.id !== id) return d;
        const newRate = updates.interestRate !== undefined ? updates.interestRate : d.interestRate;
        const newRateType = updates.rateType !== undefined ? updates.rateType : d.rateType;
        const effectiveAPR = calculateEffectiveAPR(newRate, newRateType);
        return { ...d, ...updates, effectiveAPR, dueDate: updates.nextDueDate || d.nextDueDate };
      })
    }));

    updateDebtAccountInDB(id, updates);
  },

  deleteDebtAccount: (id) => {
    set((state: StoreState) => ({
      debtAccounts: state.debtAccounts.filter((d) => d.id !== id)
    }));
    deleteDebtAccountFromDB(id);
  },

  logDebtPayment: ({ debtId, amount, paidBy }) => {
    const current = get().debtAccounts.find(d => d.id === debtId);
    if (!current || amount <= 0) return;

    const monthlyRate = (current.effectiveAPR / 100) / 12;
    const interestPaid = Math.round(current.balance * monthlyRate);
    const principalPaid = Math.max(0, amount - interestPaid);
    const newBalance = Math.max(0, current.balance - principalPaid);
    const todayStr = new Date().toISOString().split('T')[0];

    const paymentRecord: DebtPayment = {
      id: crypto.randomUUID(),
      debtId,
      amount,
      principalPaid,
      interestPaid,
      paymentDate: todayStr,
      paidBy: paidBy || get().currentUser?.name || 'Leslie'
    };

    const nextDueDateObj = new Date(current.nextDueDate || todayStr);
    nextDueDateObj.setMonth(nextDueDateObj.getMonth() + 1);
    const nextDueDateStr = nextDueDateObj.toISOString().split('T')[0];

    const isPaidOff = newBalance <= 0;

    set((state: StoreState) => ({
      debtAccounts: state.debtAccounts.map((d) => {
        if (d.id !== debtId) return d;
        const updatedPayments = [paymentRecord, ...(d.payments || [])];
        return {
          ...d,
          balance: newBalance,
          status: isPaidOff ? 'PAID_OFF' : 'ACTIVE',
          nextDueDate: nextDueDateStr,
          dueDate: nextDueDateStr,
          payments: updatedPayments
        };
      })
    }));

    if (current.paidBy === 'Shared') {
      get().addTransaction({
        title: `Debt Payment: ${current.name}`,
        amount,
        type: 'EXPENSE',
        category: 'Expenses',
        paidBy: (paidBy || get().currentUser?.name || 'Leslie') as any,
        account: 'Joint Account',
        isShared: true,
        date: 'Just now'
      });
    }

    updateDebtAccountInDB(debtId, { balance: newBalance, status: isPaidOff ? 'PAID_OFF' : 'ACTIVE', nextDueDate: nextDueDateStr });
    logDebtPaymentInDB(paymentRecord);
  },

  // SAVINGS GOALS CRUD
  addSavingsGoal: (goalInput) => {
    const current = goalInput.startingBalance || 0;
    const suggested = calculateRequiredContribution(
      goalInput.targetAmount,
      current,
      goalInput.targetDate,
      goalInput.cadence
    );

    const newGoal: SavingsGoal = {
      ...goalInput,
      id: crypto.randomUUID(),
      currentAmount: current,
      suggestedContribution: suggested,
      status: 'ACTIVE',
      goalAmount: goalInput.targetAmount,
      monthlyContribution: suggested
    };

    set((state: StoreState) => ({
      savingsGoals: [newGoal, ...state.savingsGoals]
    }));

    const householdId = get().household?.id;
    if (householdId) saveSavingsGoalToDB(newGoal, householdId);
  },

  updateSavingsGoal: (id, updates) => {
    set((state: StoreState) => ({
      savingsGoals: state.savingsGoals.map((g) => {
        if (g.id !== id) return g;
        const target = updates.targetAmount !== undefined ? updates.targetAmount : g.targetAmount;
        const current = updates.currentAmount !== undefined ? updates.currentAmount : g.currentAmount;
        const targetDate = updates.targetDate !== undefined ? updates.targetDate : g.targetDate;
        const cadence = updates.cadence !== undefined ? updates.cadence : g.cadence;
        const suggested = calculateRequiredContribution(target, current, targetDate, cadence);

        return {
          ...g,
          ...updates,
          suggestedContribution: suggested,
          goalAmount: target,
          monthlyContribution: suggested
        };
      })
    }));

    updateSavingsGoalInDB(id, updates);
  },

  deleteSavingsGoal: (id) => {
    set((state: StoreState) => ({
      savingsGoals: state.savingsGoals.filter((g) => g.id !== id)
    }));
    deleteSavingsGoalFromDB(id);
  },

  archiveSavingsGoal: (id) => {
    set((state: StoreState) => ({
      savingsGoals: state.savingsGoals.map((g) => (g.id === id ? { ...g, status: 'ARCHIVED' as const } : g))
    }));
    updateSavingsGoalInDB(id, { status: 'ARCHIVED' });
  },

  logSavingsContribution: ({ goalId, amount, contributorName, note }) => {
    const goal = get().savingsGoals.find(g => g.id === goalId);
    if (!goal || amount <= 0) return;

    const newCurrent = (goal.currentAmount || 0) + amount;
    const isCompleted = newCurrent >= goal.targetAmount;
    const todayStr = new Date().toISOString().split('T')[0];
    const contributor = contributorName || get().currentUser?.name || 'Leslie';

    const contributionRecord: SavingsContribution = {
      id: crypto.randomUUID(),
      goalId,
      contributorName: contributor,
      amount,
      contributionDate: todayStr,
      note
    };

    set((state: StoreState) => ({
      savingsGoals: state.savingsGoals.map((g) => {
        if (g.id !== goalId) return g;
        const updatedContribs = [contributionRecord, ...(g.contributions || [])];
        return {
          ...g,
          currentAmount: newCurrent,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          contributions: updatedContribs
        };
      })
    }));

    updateSavingsGoalInDB(goalId, { currentAmount: newCurrent, status: isCompleted ? 'COMPLETED' : 'ACTIVE' });
    logSavingsContributionInDB(contributionRecord);
  },

  // INCOME STREAMS CRUD
  addIncomeStream: (streamInput) => {
    const newStream: IncomeStream = {
      ...streamInput,
      id: crypto.randomUUID(),
      status: 'ACTIVE'
    };

    set((state: StoreState) => ({
      incomeStreams: [newStream, ...state.incomeStreams]
    }));

    const householdId = get().household?.id;
    if (householdId) saveIncomeStreamToDB(newStream, householdId);
  },

  updateIncomeStream: (id, updates) => {
    set((state: StoreState) => ({
      incomeStreams: state.incomeStreams.map((i) => (i.id === id ? { ...i, ...updates } : i))
    }));
    updateIncomeStreamInDB(id, updates);
  },

  deleteIncomeStream: (id) => {
    set((state: StoreState) => ({
      incomeStreams: state.incomeStreams.filter((i) => i.id !== id)
    }));
    deleteIncomeStreamFromDB(id);
  },

  logIncomePayout: (id) => {
    const stream = get().incomeStreams.find(i => i.id === id);
    if (!stream) return;

    const currentUserName = get().currentUser?.name || 'Leslie';
    const paidByTarget = stream.earnedBy === 'Joint'
      ? (currentUserName === 'Asa' ? 'Asa' : 'Leslie')
      : (stream.earnedBy as 'Leslie' | 'Asa');

    get().addTransaction({
      title: `Income: ${stream.title}`,
      amount: stream.amount,
      type: 'INCOME',
      category: 'Income',
      paidBy: paidByTarget,
      account: 'Joint Account',
      isShared: stream.earnedBy === 'Joint',
      date: 'Just now'
    });
  }
});
