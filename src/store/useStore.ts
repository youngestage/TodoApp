import { create } from 'zustand';
import {
  ViewMode,
  User,
  Household,
  Task,
  Transaction,
  RecurringBill,
  ChatMessage,
  ContextualComment,
  QuickNote,
  DebtAccount,
  SavingsGoal,
  AppPreferences,
  BudgetCategoryType
} from '../types';
import { sendPushNotification } from '../utils/notifications';

interface StoreState {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  currentUser: User;
  partnerUser: User;
  updateUserAvatar: (url: string) => void;
  household: Household;

  // Privacy & Balance visibility
  hideBalances: boolean;
  toggleHideBalances: () => void;

  // Full-Screen Chat State
  isFullChatActive: boolean;
  setFullChatActive: (active: boolean) => void;

  // Notifications Drawer & Push State
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotificationsOpen: () => void;

  // Modals & Drawers
  isQuickActionOpen: boolean;
  setQuickActionOpen: (open: boolean) => void;
  quickActionTab: 'expense' | 'task' | 'message';
  setQuickActionTab: (tab: 'expense' | 'task' | 'message' | any) => void;
  
  isSettleUpOpen: boolean;
  setSettleUpOpen: (open: boolean) => void;

  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  isQuickNoteOpen: boolean;
  setQuickNoteOpen: (open: boolean) => void;

  activeContextualThread: { type: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL'; id: string; title: string } | null;
  openContextualThread: (item: { type: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL'; id: string; title: string }) => void;
  closeContextualThread: () => void;

  // Global App Preferences (Step 01 & 02 Blueprint)
  preferences: AppPreferences;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;

  // Categories & Subcategories (Step 03 Blueprint)
  subcategories: Record<BudgetCategoryType, string[]>;
  addSubcategory: (category: BudgetCategoryType, name: string) => boolean;
  deleteSubcategory: (category: BudgetCategoryType, name: string) => void;

  // Payment Accounts (Max 10)
  paymentAccounts: string[];
  addPaymentAccount: (account: string) => boolean;
  deletePaymentAccount: (account: string) => void;

  // Debt Strategy Configuration (Step 04 Blueprint)
  debtAccounts: DebtAccount[];
  debtStrategy: 'Snowball' | 'Avalanche' | 'Minimum';
  extraDebtContribution: number;
  updateDebtConfig: (strategy: 'Snowball' | 'Avalanche' | 'Minimum', extra: number) => void;
  addDebtAccount: (debt: Omit<DebtAccount, 'id'>) => void;

  // Savings & Sinking Funds (Step 05 Blueprint)
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;

  // Tasks
  tasks: Task[];
  taskFilter: 'All' | 'Mine' | 'Partner' | 'Joint';
  setTaskFilter: (filter: 'All' | 'Mine' | 'Partner' | 'Joint') => void;
  toggleJointTaskTap: (taskId: string, user: 'Leslie' | 'Asa') => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'userACompleted' | 'userBCompleted'>) => void;

  // Transactions & Budget
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  settleUpBalance: () => void;

  // Recurring Bills
  recurringBills: RecurringBill[];
  payRecurringBill: (id: string) => void;

  // Chat & Buzz
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string, attachment?: ChatMessage['attachment']) => void;
  sendBuzz: () => void;

  // Contextual Comments
  contextualComments: ContextualComment[];
  addContextualComment: (targetId: string, targetType: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL', text: string) => void;

  // Quick Notes
  quickNotes: QuickNote[];
  addQuickNote: (text: string) => void;
}

const initialUserLeslie: User = {
  id: 'usr_leslie',
  name: 'Leslie',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isOnline: true,
  role: 'partner_a'
};

const initialUserAsa: User = {
  id: 'usr_asa',
  name: 'Asa',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  isOnline: true,
  role: 'partner_b'
};

const initialHousehold: Household = {
  id: 'hh_leslie_asa',
  name: 'Leslie & Asa',
  inviteCode: 'LESLIE-ASA-2026',
  maxMembers: 2,
  members: [initialUserLeslie, initialUserAsa],
  settleBalance: {
    debtor: 'Asa',
    creditor: 'Leslie',
    amount: 12000,
    currency: '₦'
  }
};

const initialPreferences: AppPreferences = {
  currency: '₦',
  budgetYear: 2026,
  firstDayOfWeek: 'Monday'
};

const initialSubcategories: Record<BudgetCategoryType, string[]> = {
  Income: ['Salary', 'Freelance Payout', 'Dividends', 'Gift Income'],
  Expenses: ['Groceries', 'Dining Out', 'Fuel & Transport', 'Shopping', 'Home Care'],
  Bills: ['Fibre Internet', 'Electricity', 'Estate Charge', 'Streaming Subscriptions'],
  Savings: ['Emergency Fund', 'Cape Town Travel Fund', 'Anniversary Pot'],
  Investments: ['S&P 500 Index', 'Real Estate Trust', 'Tech Equities'],
  Debt: ['Student Loan', 'Credit Card Balance', 'Car Financing']
};

const initialPaymentAccounts = [
  'Opay (Leslie)',
  'Kuda (Asa)',
  'GTBank (Leslie)',
  'PiggyVest',
  'Joint Account'
];

const initialDebtAccounts: DebtAccount[] = [
  {
    id: 'debt-1',
    name: 'Household Credit Card',
    balance: 180000,
    interestRate: 15.5,
    minimumPayment: 25000,
    dueDate: '25th of month',
    startDate: '2025-11-01'
  },
  {
    id: 'debt-2',
    name: 'Car Financing Loan',
    balance: 450000,
    interestRate: 8.2,
    minimumPayment: 45000,
    dueDate: '10th of month',
    startDate: '2025-06-15'
  }
];

const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'sg-1',
    name: 'Cape Town Trip Fund',
    goalAmount: 800000,
    startingBalance: 320000,
    monthlyContribution: 80000
  },
  {
    id: 'sg-2',
    name: 'Rainy Day Emergency Pot',
    goalAmount: 1200000,
    startingBalance: 650000,
    monthlyContribution: 100000
  }
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Book romantic dinner at Chef Alain',
    description: 'Special 3-course tasting menu for anniversary month',
    category: 'Date Night',
    isJoint: true,
    userACompleted: true,
    userBCompleted: false,
    completed: false,
    assignedToName: 'Both',
    dueDate: 'Tonight, 8:00 PM',
    priority: 'High',
    linkedExpense: { amount: 35000, category: 'Dining' },
    commentsCount: 2
  },
  {
    id: 'task-2',
    title: 'Pay monthly Fibre Internet bill',
    description: 'Auto-logs to household Budget upon completion',
    category: 'Bills',
    isJoint: false,
    userACompleted: true,
    userBCompleted: true,
    completed: true,
    assignedToName: 'Leslie',
    dueDate: 'Yesterday',
    priority: 'High',
    linkedExpense: { amount: 28500, category: 'Bills' },
    commentsCount: 1
  },
  {
    id: 'task-3',
    title: 'Pick up organic produce from Farmers Market',
    description: 'Avocados, sourdough bread, fresh rosemary',
    category: 'Shopping',
    isJoint: true,
    userACompleted: false,
    userBCompleted: false,
    completed: false,
    assignedToName: 'Both',
    dueDate: 'Tomorrow',
    priority: 'Medium',
    commentsCount: 0
  },
  {
    id: 'task-4',
    title: 'Confirm Airbnb reservation in Cape Town',
    description: 'Check-in details and airport shuttle pick-up',
    category: 'Travel',
    isJoint: false,
    userACompleted: false,
    userBCompleted: false,
    completed: false,
    assignedToName: 'Asa',
    dueDate: 'Saturday',
    priority: 'High',
    linkedExpense: { amount: 180000, category: 'Travel' },
    commentsCount: 4
  },
  {
    id: 'task-5',
    title: 'Restock espresso roast coffee beans',
    category: 'Home',
    isJoint: false,
    userACompleted: true,
    userBCompleted: true,
    completed: true,
    assignedToName: 'Leslie',
    dueDate: '3 days ago',
    priority: 'Low',
    commentsCount: 0
  }
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Monthly Groceries at Spar',
    amount: 64500,
    type: 'EXPENSE',
    category: 'Expenses',
    paidBy: 'Leslie',
    account: 'Opay (Leslie)',
    isShared: true,
    date: 'Today, 10:30 AM',
    commentsCount: 1
  },
  {
    id: 'tx-2',
    title: 'Fibre Internet Subscription',
    amount: 28500,
    type: 'EXPENSE',
    category: 'Bills',
    paidBy: 'Leslie',
    account: 'Opay (Leslie)',
    isShared: true,
    date: 'Yesterday',
    commentsCount: 0
  },
  {
    id: 'tx-3',
    title: 'Freelance Brand Project Payout',
    amount: 450000,
    type: 'INCOME',
    category: 'Income',
    paidBy: 'Asa',
    account: 'Kuda (Asa)',
    isShared: true,
    date: 'Aug 5, 2026',
    commentsCount: 2
  },
  {
    id: 'tx-4',
    title: 'Emergency Rainy Day Deposit',
    amount: 100000,
    type: 'EXPENSE',
    category: 'Savings',
    paidBy: 'Asa',
    account: 'PiggyVest',
    isShared: true,
    date: 'Aug 3, 2026',
    commentsCount: 0
  }
];

const initialRecurringBills: RecurringBill[] = [
  {
    id: 'bill-1',
    title: 'Estate Service Charge & Security',
    amount: 45000,
    dueDate: 'Due in 3 days',
    dueDayNumber: 15,
    category: 'Bills',
    status: 'DUE',
    paidBy: 'Shared',
    autoPrefill: true
  },
  {
    id: 'bill-2',
    title: 'Canva & Adobe Creative Suite',
    amount: 14500,
    dueDate: 'Due in 7 days',
    dueDayNumber: 20,
    category: 'Bills',
    status: 'UPCOMING',
    paidBy: 'Asa',
    autoPrefill: true
  },
  {
    id: 'bill-3',
    title: 'Starlink Broadband Unlimited',
    amount: 38000,
    dueDate: 'Paid Aug 1',
    dueDayNumber: 1,
    category: 'Bills',
    status: 'PAID',
    paidBy: 'Leslie',
    autoPrefill: true
  }
];

const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Asa',
    content: 'Hey babe! Did you pay for the internet bill already?',
    timestamp: '10:14 AM'
  },
  {
    id: 'msg-2',
    senderName: 'Leslie',
    content: 'Yes! Just logged it under Bills (₦28,500). Auto-completed the task too ✨',
    timestamp: '10:16 AM',
    attachment: {
      type: 'EXPENSE',
      title: 'Fibre Internet Subscription',
      amount: 28500,
      id: 'tx-2'
    }
  },
  {
    id: 'msg-3',
    senderName: 'Asa',
    content: 'Awesome! I will check off my side of the dinner reservation right away 🍷',
    timestamp: '10:20 AM'
  }
];

const initialComments: ContextualComment[] = [
  {
    id: 'c-1',
    targetId: 'task-1',
    targetType: 'TASK',
    authorName: 'Leslie',
    text: 'I requested a cozy outdoor patio table for us!',
    timestamp: '2 hours ago'
  },
  {
    id: 'c-2',
    targetId: 'task-1',
    targetType: 'TASK',
    authorName: 'Asa',
    text: 'Perfect! I will bring the vintage wine we saved.',
    timestamp: '1 hour ago'
  },
  {
    id: 'c-3',
    targetId: 'tx-1',
    targetType: 'TRANSACTION',
    authorName: 'Leslie',
    text: 'Included extra fruits and almond milk for the week.',
    timestamp: '3 hours ago'
  }
];

const initialQuickNotes: QuickNote[] = [
  {
    id: 'qn-1',
    text: 'Check if we need extra house keys made for the housekeeper',
    authorName: 'Leslie',
    timestamp: 'Today, 9:00 AM'
  },
  {
    id: 'qn-2',
    text: 'Remember to order replacement water filter cartridges',
    authorName: 'Asa',
    timestamp: 'Yesterday'
  }
];

export const useStore = create<StoreState>((set, get) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view, isFullChatActive: false }),
  currentUser: initialUserLeslie,
  partnerUser: initialUserAsa,
  updateUserAvatar: (url) => set((state) => ({
    currentUser: { ...state.currentUser, avatarUrl: url }
  })),
  household: initialHousehold,

  hideBalances: false,
  toggleHideBalances: () => set((state) => ({ hideBalances: !state.hideBalances })),

  isFullChatActive: false,
  setFullChatActive: (active) => set({ isFullChatActive: active }),

  isNotificationsOpen: false,
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  toggleNotificationsOpen: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  isQuickActionOpen: false,
  setQuickActionOpen: (open) => set({ isQuickActionOpen: open }),
  quickActionTab: 'expense',
  setQuickActionTab: (tab) => set({ quickActionTab: tab }),

  isSettleUpOpen: false,
  setSettleUpOpen: (open) => set({ isSettleUpOpen: open }),

  isSettingsOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  isQuickNoteOpen: false,
  setQuickNoteOpen: (open) => set({ isQuickNoteOpen: open }),

  activeContextualThread: null,
  openContextualThread: (item) => set({ activeContextualThread: item }),
  closeContextualThread: () => set({ activeContextualThread: null }),

  // Blueprint Settings State & Actions
  preferences: initialPreferences,
  updatePreferences: (prefs) => set((state) => ({
    preferences: { ...state.preferences, ...prefs },
    household: prefs.currency
      ? { ...state.household, settleBalance: { ...state.household.settleBalance, currency: prefs.currency } }
      : state.household
  })),

  subcategories: initialSubcategories,
  addSubcategory: (cat, name) => {
    const state = get();
    const existing = state.subcategories[cat] || [];
    if (existing.some(s => s.toLowerCase() === name.trim().toLowerCase())) {
      return false;
    }
    set({
      subcategories: {
        ...state.subcategories,
        [cat]: [...existing, name.trim()]
      }
    });
    return true;
  },
  deleteSubcategory: (cat, name) => set((state) => ({
    subcategories: {
      ...state.subcategories,
      [cat]: (state.subcategories[cat] || []).filter(s => s !== name)
    }
  })),

  paymentAccounts: initialPaymentAccounts,
  addPaymentAccount: (accountName) => {
    const state = get();
    if (state.paymentAccounts.length >= 10) return false;
    if (state.paymentAccounts.some(a => a.toLowerCase() === accountName.trim().toLowerCase())) return false;
    set({ paymentAccounts: [...state.paymentAccounts, accountName.trim()] });
    return true;
  },
  deletePaymentAccount: (accountName) => set((state) => ({
    paymentAccounts: state.paymentAccounts.filter(a => a !== accountName)
  })),

  debtAccounts: initialDebtAccounts,
  debtStrategy: 'Snowball',
  extraDebtContribution: 30000,
  updateDebtConfig: (strategy, extra) => set({ debtStrategy: strategy, extraDebtContribution: extra }),
  addDebtAccount: (debtData) => set((state) => ({
    debtAccounts: [...state.debtAccounts, { ...debtData, id: `debt-${Date.now()}` }]
  })),

  savingsGoals: initialSavingsGoals,
  addSavingsGoal: (goalData) => set((state) => ({
    savingsGoals: [...state.savingsGoals, { ...goalData, id: `sg-${Date.now()}` }]
  })),

  // Tasks
  tasks: initialTasks,
  taskFilter: 'All',
  setTaskFilter: (filter) => set({ taskFilter: filter }),

  toggleJointTaskTap: (taskId, user) => set((state) => {
    if (user !== state.currentUser.name) {
      console.warn(`User ${state.currentUser.name} cannot tick ${user}'s task side.`);
      return state;
    }

    const updatedTasks = state.tasks.map((task) => {
      if (task.id !== taskId) return task;

      let userACompleted = task.userACompleted;
      let userBCompleted = task.userBCompleted;

      if (user === 'Leslie') {
        userACompleted = !userACompleted;
      } else {
        userBCompleted = !userBCompleted;
      }

      const isFullyCompleted = task.isJoint
        ? (userACompleted && userBCompleted)
        : (userACompleted || userBCompleted);

      const statusText = isFullyCompleted
        ? 'Completed'
        : userACompleted || userBCompleted
        ? '1/2 Joint Progress'
        : 'Reopened';

      sendPushNotification(
        `Task Update: ${task.title}`,
        `${user} updated task status: ${statusText}`,
        { tag: `task-${taskId}` }
      );

      if (isFullyCompleted && !task.completed && task.linkedExpense) {
        const newTx: Transaction = {
          id: `tx-autolog-${Date.now()}`,
          title: task.title,
          amount: task.linkedExpense.amount,
          type: 'EXPENSE',
          category: task.linkedExpense.category as any || 'Bills',
          paidBy: user,
          account: user === 'Leslie' ? 'Opay (Leslie)' : 'Kuda (Asa)',
          isShared: true,
          date: 'Just now (Auto-logged)'
        };
        setTimeout(() => {
          set((curr) => ({ transactions: [newTx, ...curr.transactions] }));
          sendPushNotification(
            'Auto-Logged Expense',
            `${state.preferences.currency}${newTx.amount.toLocaleString()} logged to ${newTx.category} upon task completion`
          );
        }, 100);
      }

      return {
        ...task,
        userACompleted,
        userBCompleted,
        completed: isFullyCompleted
      };
    });

    return { tasks: updatedTasks };
  }),

  addTask: (newTaskData) => set((state) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      userACompleted: false,
      userBCompleted: false,
      completed: false,
      commentsCount: 0
    };

    sendPushNotification(
      'New Household Task',
      `"${newTask.title}" added under ${newTask.category} by ${state.currentUser.name}`
    );

    return { tasks: [newTask, ...state.tasks] };
  }),

  transactions: initialTransactions,
  addTransaction: (txData) => set((state) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`
    };

    let newSettleAmount = state.household.settleBalance.amount;
    if (txData.isShared && txData.type === 'EXPENSE') {
      const half = txData.amount / 2;
      if (txData.paidBy === 'Leslie') {
        newSettleAmount += half;
      } else {
        newSettleAmount -= half;
      }
    }

    sendPushNotification(
      'Expense Logged',
      `${state.preferences.currency}${txData.amount.toLocaleString()} for "${txData.title}" paid by ${txData.paidBy}`
    );

    return {
      transactions: [newTx, ...state.transactions],
      household: {
        ...state.household,
        settleBalance: {
          ...state.household.settleBalance,
          amount: Math.max(0, Math.round(newSettleAmount))
        }
      }
    };
  }),

  settleUpBalance: () => set((state) => {
    const amount = state.household.settleBalance.amount;
    const debtor = state.household.settleBalance.debtor;

    sendPushNotification(
      'Household Balance Paid',
      `${state.preferences.currency}${amount.toLocaleString()} balance was settled by ${debtor}`
    );

    return {
      household: {
        ...state.household,
        settleBalance: {
          ...state.household.settleBalance,
          amount: 0
        }
      },
      isSettleUpOpen: false,
      transactions: [
        {
          id: `tx-settle-${Date.now()}`,
          title: 'Settled Household Balance',
          amount: amount,
          type: 'EXPENSE',
          category: 'Expenses',
          paidBy: debtor as 'Leslie' | 'Asa',
          account: debtor === 'Leslie' ? 'Opay (Leslie)' : 'Kuda (Asa)',
          isShared: false,
          date: 'Just now'
        },
        ...state.transactions
      ]
    };
  }),

  recurringBills: initialRecurringBills,
  payRecurringBill: (id) => set((state) => {
    const bill = state.recurringBills.find(b => b.id === id);
    if (!bill) return state;

    const updatedBills = state.recurringBills.map(b => b.id === id ? { ...b, status: 'PAID' as const } : b);

    const newTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      title: `Bill: ${bill.title}`,
      amount: bill.amount,
      type: 'EXPENSE',
      category: bill.category,
      paidBy: bill.paidBy === 'Shared' ? 'Leslie' : bill.paidBy,
      account: bill.paidBy === 'Asa' ? 'Kuda (Asa)' : 'Opay (Leslie)',
      isShared: bill.paidBy === 'Shared',
      date: 'Just now'
    };

    sendPushNotification(
      'Recurring Bill Paid',
      `Bill "${bill.title}" paid (${state.preferences.currency}${bill.amount.toLocaleString()}) and auto-logged`
    );

    return {
      recurringBills: updatedBills,
      transactions: [newTx, ...state.transactions]
    };
  }),

  chatMessages: initialChatMessages,
  sendChatMessage: (content, attachment) => set((state) => {
    sendPushNotification(
      `New Message from ${state.currentUser.name}`,
      content
    );

    return {
      chatMessages: [
        ...state.chatMessages,
        {
          id: `msg-${Date.now()}`,
          senderName: 'Leslie',
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment
        }
      ]
    };
  }),

  sendBuzz: () => set((state) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } catch (e) {}
    }

    sendPushNotification(
      '⚡ Partner Buzz Alert!',
      `${state.currentUser.name} buzzed ${state.partnerUser.name}! Tap to respond.`
    );

    const buzzMsg: ChatMessage = {
      id: `msg-buzz-${Date.now()}`,
      senderName: state.currentUser.name,
      content: `⚡ Buzzed ${state.partnerUser.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    return {
      chatMessages: [...state.chatMessages, buzzMsg]
    };
  }),

  contextualComments: initialComments,
  addContextualComment: (targetId, targetType, text) => set((state) => {
    sendPushNotification(
      'Inline Comment Added',
      `Leslie: "${text}"`
    );

    return {
      contextualComments: [
        ...state.contextualComments,
        {
          id: `c-${Date.now()}`,
          targetId,
          targetType,
          authorName: 'Leslie',
          text,
          timestamp: 'Just now'
        }
      ]
    };
  }),

  quickNotes: initialQuickNotes,
  addQuickNote: (text) => set((state) => {
    sendPushNotification(
      'Quick Note Saved',
      `Note: "${text}"`
    );

    return {
      quickNotes: [
        {
          id: `qn-${Date.now()}`,
          text,
          authorName: 'Leslie',
          timestamp: 'Just now'
        },
        ...state.quickNotes
      ]
    };
  })
}));
