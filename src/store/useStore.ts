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
import { supabase } from '../lib/supabase';

interface StoreState {
  // Auth & Session
  session: any | null;
  setSession: (session: any) => void;
  logout: () => Promise<void>;
  fetchHouseholdData: (householdId: string) => Promise<void>;

  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  currentUser: User;
  partnerUser: User;
  updateUserAvatar: (url: string) => void;
  household: Household;
  updateHouseholdStartDate: (date: string) => void;

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

  // Global App Preferences
  preferences: AppPreferences;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;

  // Categories & Subcategories
  subcategories: Record<BudgetCategoryType, string[]>;
  addSubcategory: (category: BudgetCategoryType, name: string) => boolean;
  deleteSubcategory: (category: BudgetCategoryType, name: string) => void;

  // Payment Accounts (Max 10)
  paymentAccounts: string[];
  addPaymentAccount: (account: string) => boolean;
  deletePaymentAccount: (account: string) => void;

  // Debt Strategy Configuration
  debtAccounts: DebtAccount[];
  debtStrategy: 'Snowball' | 'Avalanche' | 'Minimum';
  extraDebtContribution: number;
  updateDebtConfig: (strategy: 'Snowball' | 'Avalanche' | 'Minimum', extra: number) => void;
  addDebtAccount: (debt: Omit<DebtAccount, 'id'>) => void;

  // Savings & Sinking Funds
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;

  // Tasks
  tasks: Task[];
  taskFilter: 'All' | 'Mine' | 'Partner' | 'Joint';
  setTaskFilter: (filter: 'All' | 'Mine' | 'Partner' | 'Joint') => void;
  toggleJointTaskTap: (taskId: string, user: 'Leslie' | 'Asa' | string) => void;
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

const defaultUserLeslie: User = {
  id: 'usr_me',
  name: 'Partner A',
  avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Leslie&backgroundColor=EF713F',
  isOnline: true,
  role: 'partner_a'
};

const defaultUserAsa: User = {
  id: 'usr_partner',
  name: 'Partner B',
  avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=AsaPartner&backgroundColor=BEABD8',
  isOnline: true,
  role: 'partner_b'
};

const defaultHousehold: Household = {
  id: 'hh_initial',
  name: 'My Household',
  inviteCode: 'CREATE-KEY',
  maxMembers: 2,
  members: [defaultUserLeslie],
  settleBalance: {
    debtor: 'Partner B',
    creditor: 'Partner A',
    amount: 0,
    currency: '₦'
  }
};

const defaultPreferences: AppPreferences = {
  currency: '₦',
  budgetYear: 2026,
  firstDayOfWeek: 'Monday'
};

const defaultSubcategories: Record<BudgetCategoryType, string[]> = {
  Income: ['Salary', 'Freelance Payout', 'Dividends', 'Gift Income'],
  Expenses: ['Groceries', 'Dining Out', 'Fuel & Transport', 'Shopping', 'Home Care'],
  Bills: ['Fibre Internet', 'Electricity', 'Estate Charge', 'Streaming Subscriptions'],
  Savings: ['Emergency Fund', 'Cape Town Travel Fund', 'Anniversary Pot'],
  Investments: ['S&P 500 Index', 'Real Estate Trust', 'Tech Equities'],
  Debt: ['Student Loan', 'Credit Card Balance', 'Car Financing']
};

const defaultPaymentAccounts = [
  'Opay (Partner A)',
  'Kuda (Partner B)',
  'GTBank',
  'PiggyVest',
  'Joint Account'
];

export const useStore = create<StoreState>((set, get) => ({
  session: null,
  setSession: (session) => {
    set({ session });
    if (session?.user) {
      const metadata = session.user.user_metadata || {};
      const name = metadata.name || session.user.email?.split('@')[0] || 'Partner A';
      
      set((state) => ({
        currentUser: {
          id: session.user.id,
          name,
          avatarUrl: metadata.avatar_url || 'https://api.dicebear.com/7.x/micah/svg?seed=' + name + '&backgroundColor=EF713F',
          isOnline: true,
          role: 'partner_a'
        }
      }));
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {}
    set({
      session: null,
      currentView: 'onboarding',
      tasks: [],
      transactions: [],
      recurringBills: [],
      chatMessages: [],
      quickNotes: [],
      contextualComments: [],
      debtAccounts: [],
      savingsGoals: []
    });
  },

  fetchHouseholdData: async (householdId: string) => {
    try {
      // 1. Fetch household info and profiles
      const { data: hhData } = await supabase.from('households').select('*').eq('id', householdId).single();
      const { data: profsData } = await supabase.from('profiles').select('*').eq('household_id', householdId);

      if (hhData) {
        const syncedMembers = (profsData || []).map(p => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatar_url || 'https://api.dicebear.com/7.x/micah/svg?seed=' + p.name,
          isOnline: true,
          role: p.role as any || 'partner_a'
        }));

        set((state) => ({
          household: {
            ...state.household,
            id: hhData.id,
            name: hhData.name,
            inviteCode: hhData.invite_code,
            maxMembers: hhData.max_members || 2,
            members: syncedMembers.length > 0 ? syncedMembers : [state.currentUser],
            settleBalance: {
              debtor: syncedMembers[1]?.name || 'Partner B',
              creditor: syncedMembers[0]?.name || state.currentUser.name,
              amount: 0,
              currency: hhData.currency || '₦'
            }
          }
        }));
      }

      // 2. Fetch tasks
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('household_id', householdId);
      if (tasksData) {
        set({
          tasks: tasksData.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            isJoint: t.is_joint,
            userACompleted: t.user_a_completed,
            userBCompleted: t.user_b_completed,
            completed: t.completed,
            assignedToName: t.assigned_to_name || 'Both',
            dueDate: t.due_date || 'Today',
            priority: t.priority || 'Medium',
            commentsCount: t.comments_count || 0
          }))
        });
      }

      // Fetch transactions
      const { data: txData } = await supabase.from('transactions').select('*').eq('household_id', householdId);
      if (txData) {
        set({
          transactions: txData.map(tx => ({
            id: tx.id,
            title: tx.title,
            amount: Number(tx.amount),
            type: tx.type,
            category: tx.category,
            paidBy: tx.paid_by_name,
            account: tx.account,
            isShared: tx.is_shared,
            date: tx.date || 'Just now',
            commentsCount: tx.comments_count || 0
          }))
        });
      }

      // Fetch recurring bills
      const { data: billsData } = await supabase.from('recurring_bills').select('*').eq('household_id', householdId);
      if (billsData) {
        set({
          recurringBills: billsData.map(b => ({
            id: b.id,
            title: b.title,
            amount: Number(b.amount),
            dueDate: b.due_date || 'Due soon',
            dueDayNumber: b.due_day_number || 1,
            category: b.category,
            status: b.status,
            paidBy: b.paid_by_name || 'Shared',
            autoPrefill: b.auto_prefill
          }))
        });
      }

      // Fetch chat messages
      const { data: chatData } = await supabase.from('chat_messages').select('*').eq('household_id', householdId).order('created_at', { ascending: true });
      if (chatData) {
        set({
          chatMessages: chatData.map(m => ({
            id: m.id,
            senderName: m.sender_name,
            content: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: m.attachment_type ? {
              type: m.attachment_type,
              title: m.attachment_title || '',
              amount: m.attachment_amount ? Number(m.attachment_amount) : undefined,
              id: m.attachment_ref_id || m.id
            } : undefined
          }))
        });
      }

      // Fetch quick notes
      const { data: notesData } = await supabase.from('quick_notes').select('*').eq('household_id', householdId);
      if (notesData) {
        set({
          quickNotes: notesData.map(n => ({
            id: n.id,
            text: n.text,
            authorName: n.author_name,
            timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        });
      }
    } catch (err) {
      console.warn('Error fetching household data from Supabase:', err);
    }
  },

  currentView: 'onboarding',
  setCurrentView: (view) => set({ currentView: view, isFullChatActive: false }),
  currentUser: defaultUserLeslie,
  partnerUser: defaultUserAsa,
  updateUserAvatar: (url) => set((state) => ({
    currentUser: { ...state.currentUser, avatarUrl: url }
  })),
  household: defaultHousehold,
  updateHouseholdStartDate: (date) => set((state) => ({
    household: {
      ...state.household,
      relationshipStartDate: date
    }
  })),

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

  preferences: defaultPreferences,
  updatePreferences: (prefs) => set((state) => ({
    preferences: { ...state.preferences, ...prefs }
  })),

  subcategories: defaultSubcategories,
  addSubcategory: (category, name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const currentList = get().subcategories[category] || [];
    if (currentList.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      return false;
    }
    if (currentList.length >= 20) return false;

    set((state) => ({
      subcategories: {
        ...state.subcategories,
        [category]: [...currentList, trimmed]
      }
    }));
    return true;
  },

  deleteSubcategory: (category, name) => set((state) => ({
    subcategories: {
      ...state.subcategories,
      [category]: (state.subcategories[category] || []).filter(item => item !== name)
    }
  })),

  paymentAccounts: defaultPaymentAccounts,
  addPaymentAccount: (account) => {
    const trimmed = account.trim();
    if (!trimmed) return false;
    const currentList = get().paymentAccounts;
    if (currentList.some(item => item.toLowerCase() === trimmed.toLowerCase())) return false;
    if (currentList.length >= 10) return false;

    set((state) => ({
      paymentAccounts: [...state.paymentAccounts, trimmed]
    }));
    return true;
  },

  deletePaymentAccount: (account) => set((state) => ({
    paymentAccounts: state.paymentAccounts.filter(item => item !== account)
  })),

  debtAccounts: [],
  debtStrategy: 'Snowball',
  extraDebtContribution: 0,
  updateDebtConfig: (strategy, extra) => set({ debtStrategy: strategy, extraDebtContribution: extra }),
  addDebtAccount: (debt) => set((state) => ({
    debtAccounts: [...state.debtAccounts, { ...debt, id: `debt-${Date.now()}` }]
  })),

  savingsGoals: [],
  addSavingsGoal: (goal) => set((state) => ({
    savingsGoals: [...state.savingsGoals, { ...goal, id: `sg-${Date.now()}` }]
  })),

  // Empty starting arrays (Dummy data cleared!)
  tasks: [],
  taskFilter: 'All',
  setTaskFilter: (filter) => set({ taskFilter: filter }),
  toggleJointTaskTap: (taskId, user) => set((state) => {
    const updatedTasks = state.tasks.map((task) => {
      if (task.id !== taskId) return task;

      if (!task.isJoint) {
        const nowCompleted = !task.completed;
        return { ...task, completed: nowCompleted, userACompleted: nowCompleted, userBCompleted: nowCompleted };
      }

      let newA = task.userACompleted;
      let newB = task.userBCompleted;

      if (user === state.currentUser.name || user === 'Leslie') {
        newA = !newA;
      } else {
        newB = !newB;
      }

      const bothDone = newA && newB;
      return {
        ...task,
        userACompleted: newA,
        userBCompleted: newB,
        completed: bothDone
      };
    });

    return { tasks: updatedTasks };
  }),

  addTask: (taskData) => set((state) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      userACompleted: false,
      userBCompleted: false,
      commentsCount: 0
    };
    sendPushNotification('New Joint Task Added', `${newTask.title} was created by ${state.currentUser.name}`);
    return { tasks: [newTask, ...state.tasks] };
  }),

  transactions: [],
  addTransaction: (txData) => set((state) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      commentsCount: 0
    };

    const delta = newTx.type === 'EXPENSE' ? newTx.amount / 2 : -(newTx.amount / 2);
    const currSettle = state.household.settleBalance;
    const newAmount = currSettle.amount + delta;

    sendPushNotification('New Transaction Logged', `${newTx.title} (₦${newTx.amount.toLocaleString()}) by ${newTx.paidBy}`);

    return {
      transactions: [newTx, ...state.transactions],
      household: {
        ...state.household,
        settleBalance: {
          ...currSettle,
          amount: Math.abs(newAmount),
          debtor: newAmount >= 0 ? state.partnerUser.name : state.currentUser.name,
          creditor: newAmount >= 0 ? state.currentUser.name : state.partnerUser.name
        }
      }
    };
  }),

  settleUpBalance: () => set((state) => {
    const settleTx: Transaction = {
      id: `tx-settle-${Date.now()}`,
      title: 'Settled Household Balance',
      amount: state.household.settleBalance.amount,
      type: 'INCOME',
      category: 'Income',
      paidBy: state.household.settleBalance.debtor as any,
      account: 'Settle Up',
      isShared: true,
      date: 'Just now',
      commentsCount: 0
    };

    sendPushNotification('Balance Settled! 🎉', `Household balance of ₦${state.household.settleBalance.amount.toLocaleString()} was settled.`);

    return {
      transactions: [settleTx, ...state.transactions],
      household: {
        ...state.household,
        settleBalance: {
          ...state.household.settleBalance,
          amount: 0
        }
      }
    };
  }),

  recurringBills: [],
  payRecurringBill: (id) => set((state) => {
    const targetBill = state.recurringBills.find(b => b.id === id);
    if (!targetBill) return state;

    const updatedBills = state.recurringBills.map(b => b.id === id ? { ...b, status: 'PAID' as const } : b);
    const autoTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      title: `${targetBill.title} (Bill Auto-Pay)`,
      amount: targetBill.amount,
      type: 'EXPENSE',
      category: 'Bills',
      paidBy: state.currentUser.name as any,
      account: 'Auto-Pay Rules',
      isShared: true,
      date: 'Just now',
      commentsCount: 0
    };

    sendPushNotification('Bill Paid', `Paid ₦${targetBill.amount.toLocaleString()} for ${targetBill.title}`);

    return {
      recurringBills: updatedBills,
      transactions: [autoTx, ...state.transactions]
    };
  }),

  chatMessages: [],
  sendChatMessage: (content, attachment) => set((state) => {
    sendPushNotification(`New Message from ${state.currentUser.name}`, content);
    return {
      chatMessages: [
        ...state.chatMessages,
        {
          id: `msg-${Date.now()}`,
          senderName: state.currentUser.name,
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

  contextualComments: [],
  addContextualComment: (targetId, targetType, text) => set((state) => {
    sendPushNotification('New Thread Comment', `${state.currentUser.name}: ${text}`);
    const newComment: ContextualComment = {
      id: `comment-${Date.now()}`,
      targetId,
      targetType,
      authorName: state.currentUser.name,
      text,
      timestamp: 'Just now'
    };
    return { contextualComments: [...state.contextualComments, newComment] };
  }),

  quickNotes: [],
  addQuickNote: (text) => set((state) => {
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      text,
      authorName: state.currentUser.name,
      timestamp: 'Just now'
    };
    return { quickNotes: [newNote, ...state.quickNotes] };
  })
}));
