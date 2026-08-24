export type ViewMode = 'dashboard' | 'tasks' | 'budget' | 'chat' | 'onboarding' | 'invite' | 'settings';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  role: 'partner_a' | 'partner_b';
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  maxMembers: number;
  members: User[];
  relationshipStartDate?: string;
  settleBalance: {
    debtor: string;
    creditor: string;
    amount: number;
    currency: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'Home' | 'Bills' | 'Travel' | 'Date Night' | 'Shopping';
  isJoint: boolean;
  userACompleted: boolean;
  userBCompleted: boolean;
  completed: boolean;
  assignedToName: 'Leslie' | 'Asa' | 'Both';
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  linkedExpense?: {
    amount: number;
    category: string;
  };
  commentsCount?: number;
  subTasks?: { id: string; title: string; completed: boolean; completedBy?: string }[];
  tags?: string[];
  folderId?: string;
  completedBy?: string;
}

export interface TaskFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type BudgetCategoryType = 'Income' | 'Expenses' | 'Bills' | 'Savings' | 'Investments' | 'Debt';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category: BudgetCategoryType;
  paidBy: 'Leslie' | 'Asa';
  account: string;
  isShared: boolean;
  date: string;
  commentsCount?: number;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  dueDayNumber?: number;
  category: BudgetCategoryType;
  status: 'PAID' | 'DUE' | 'UPCOMING';
  paidBy: 'Leslie' | 'Asa' | 'Shared';
  autoPrefill: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachment?: {
    type: 'TASK' | 'EXPENSE' | 'BUZZ';
    title: string;
    amount?: number;
    id: string;
  };
}

export interface ContextualComment {
  id: string;
  targetId: string;
  targetType: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL';
  authorName: string;
  text: string;
  timestamp: string;
}

export interface QuickNote {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
}

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  startDate: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  goalAmount: number;
  startingBalance: number;
  monthlyContribution: number;
}

export interface AppPreferences {
  currency: string;
  budgetYear: number;
  firstDayOfWeek: 'Sunday' | 'Monday';
}
