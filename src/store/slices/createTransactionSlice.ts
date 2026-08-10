import { StateCreator } from 'zustand';
import { Transaction, RecurringBill, DebtAccount, SavingsGoal, BudgetCategoryType, AppPreferences } from '../../types';
import { sendPushNotification } from '../../utils/notifications';
import { StoreState } from '../useStore';

export interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  settleUpBalance: () => void;
  recurringBills: RecurringBill[];
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
  debtStrategy: 'Snowball' | 'Avalanche' | 'Minimum';
  extraDebtContribution: number;
  updateDebtConfig: (strategy: 'Snowball' | 'Avalanche' | 'Minimum', extra: number) => void;
  addDebtAccount: (debt: Omit<DebtAccount, 'id'>) => void;

  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const defaultPreferences: AppPreferences = {
  currency: '₦',
  budgetYear: 2026,
  firstDayOfWeek: 'Monday'
};

export const defaultSubcategories: Record<BudgetCategoryType, string[]> = {
  Income: ['Salary', 'Freelance Payout', 'Dividends', 'Gift Income'],
  Expenses: ['Groceries', 'Dining Out', 'Fuel & Transport', 'Shopping', 'Home Care'],
  Bills: ['Fibre Internet', 'Electricity', 'Estate Charge', 'Streaming Subscriptions'],
  Savings: ['Emergency Fund', 'Cape Town Travel Fund', 'Anniversary Pot'],
  Investments: ['S&P 500 Index', 'Real Estate Trust', 'Tech Equities'],
  Debt: ['Student Loan', 'Credit Card Balance', 'Car Financing']
};

export const defaultPaymentAccounts = [
  'Opay (Partner A)',
  'Kuda (Partner B)',
  'GTBank',
  'PiggyVest',
  'Joint Account'
];

export const createTransactionSlice: StateCreator<StoreState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  recurringBills: [],
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

  debtAccounts: [],
  debtStrategy: 'Snowball',
  extraDebtContribution: 10000,
  updateDebtConfig: (strategy, extra) => set({ debtStrategy: strategy, extraDebtContribution: extra }),
  addDebtAccount: (debt) => set((state: StoreState) => ({
    debtAccounts: [...state.debtAccounts, { ...debt, id: `debt-${Date.now()}` }]
  })),

  savingsGoals: [],
  addSavingsGoal: (goal) => set((state: StoreState) => ({
    savingsGoals: [...state.savingsGoals, { ...goal, id: `goal-${Date.now()}` }]
  })),

  addTransaction: (tx) => set((state: StoreState) => {
    sendPushNotification(
      'New Transaction Logged',
      `${tx.paidBy} logged ${tx.type === 'EXPENSE' ? 'expense' : 'income'}: ${tx.title} (${state.preferences.currency}${tx.amount})`
    );

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      commentsCount: 0
    };

    return { transactions: [newTx, ...state.transactions] };
  }),

  settleUpBalance: () => set((state: StoreState) => {
    sendPushNotification('Settle-Up Complete! 💚', 'Household balance has been settled to ₦0.');
    return {
      household: {
        ...state.household,
        settleBalance: {
          ...state.household.settleBalance,
          amount: 0
        }
      }
    };
  }),

  payRecurringBill: (id) => set((state: StoreState) => ({
    recurringBills: state.recurringBills.map((bill: RecurringBill) =>
      bill.id === id ? { ...bill, status: 'PAID' as const } : bill
    )
  }))
});
