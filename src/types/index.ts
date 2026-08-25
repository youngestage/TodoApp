export type ViewMode = 'dashboard' | 'tasks' | 'budget' | 'finances' | 'chat' | 'onboarding' | 'invite' | 'settings';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeen?: string;
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

export type BillFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type BillSplitType = 'equal' | 'percentage' | 'exact' | 'shares';
export type BillPaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'apple_pay' | 'upi' | 'other';
export type BillStatus = 'UPCOMING' | 'DUE' | 'OVERDUE' | 'PAID' | 'PAUSED';

export interface RecurringBill {
  id: string;
  householdId?: string;
  title: string;
  category: BudgetCategoryType;
  amount: number;
  currency?: string;
  icon?: string;
  notes?: string;
  frequency: BillFrequency;
  customIntervalDays?: number;
  nextDueDate: string;
  dueDate?: string;
  dueDayNumber?: number;
  paidBy: 'Leslie' | 'Asa' | 'Shared';
  splitType?: BillSplitType;
  splitDetails?: { partnerA: number; partnerB: number };
  paymentMethod?: BillPaymentMethod;
  status: BillStatus;
  autoLogTransaction?: boolean;
  reminderDaysBefore?: number;
  lastPaidDate?: string;
  autoPrefill?: boolean;
  createdAt?: string;
}

export interface Attachment {
  type: 'TASK' | 'EXPENSE' | 'BUZZ';
  title: string;
  amount?: number;
  id: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachment?: Attachment;
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

export type DebtCategory =
  | 'bank_loan'
  | 'microfinance'
  | 'digital_app'
  | 'cooperative'
  | 'ajo_esusu'
  | 'personal_family'
  | 'bnpl'
  | 'salary_advance'
  | 'credit_card'
  | 'other';

export type DebtRateType = 'flat_monthly' | 'reducing_balance' | 'daily_rate' | 'zero_interest';
export type DebtRepaymentFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'lump_sum';
export type DebtRepaymentMethod = 'salary_deduction' | 'bank_transfer' | 'direct_debit' | 'cash' | 'ussd';

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  paymentDate: string;
  paidBy?: string;
  createdAt?: string;
}

export interface DebtAccount {
  id: string;
  householdId?: string;
  name: string;
  category: DebtCategory;
  lenderName?: string;
  principalAmount: number;
  balance: number;
  rateType: DebtRateType;
  interestRate: number;
  effectiveAPR: number;
  repaymentFrequency: DebtRepaymentFrequency;
  loanTermMonths?: number;
  repaymentMethod?: DebtRepaymentMethod;
  minimumPayment: number;
  startDate?: string;
  nextDueDate?: string;
  dueDate?: string;
  currency?: string;
  paidBy: 'Leslie' | 'Asa' | 'Shared';
  isPrivate?: boolean;
  notes?: string;
  status: 'ACTIVE' | 'PAID_OFF';
  payments?: DebtPayment[];
  createdAt?: string;
}

export type GoalCategory =
  | 'Wedding'
  | 'Japa'
  | 'Rent'
  | 'New Car'
  | 'Emergency'
  | 'Travel'
  | 'Education'
  | 'Gift'
  | 'Custom';

export type GoalCadence = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'manual';
export type GoalOwnership = 'individual' | 'joint' | 'household';

export interface SavingsContribution {
  id: string;
  goalId: string;
  contributorName: string;
  amount: number;
  contributionDate: string;
  note?: string;
  createdAt?: string;
}

export interface SavingsGoal {
  id: string;
  householdId?: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  startingBalance: number;
  currency?: string;
  targetDate?: string;
  cadence: GoalCadence;
  suggestedContribution: number;
  ownership: GoalOwnership;
  externalStorageNote?: string;
  isPrivate?: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  contributions?: SavingsContribution[];
  createdAt?: string;
  goalAmount?: number;
  monthlyContribution?: number;
}

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Dividends'
  | 'Rental Income'
  | 'Gift Income'
  | 'Crypto/Investments'
  | 'Other';

export type IncomeCadence = 'monthly' | 'bi-weekly' | 'weekly' | 'one-off';

export interface IncomeStream {
  id: string;
  householdId?: string;
  title: string;
  category: IncomeCategory;
  amount: number;
  currency?: string;
  cadence: IncomeCadence;
  earnedBy: 'Leslie' | 'Asa' | 'Joint';
  notes?: string;
  status: 'ACTIVE' | 'PAUSED';
  createdAt?: string;
}

export interface AppPreferences {
  currency: string;
  budgetYear: number;
  firstDayOfWeek: 'Sunday' | 'Monday';
}
