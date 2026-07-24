// ============= ENUMS =============
export type AccountType = "cash" | "bank" | "ewallet" | "credit_card" | "other";
export type AccountClass = "asset" | "liability";
export type TransactionType = "income" | "expense" | "transfer" | "savings" | "adjustment";
export type AuditActionType = "transaction_created" | "transaction_updated" | "transaction_deleted" | "adjustment_recorded" | "account_archived";
export type AuditTargetType = "transaction" | "account";
export type CategoryType = "income" | "expense";
export type CategoryGroup = "needs" | "lifestyle" | "savings_debt" | "other";
export type FinancialStatus = "safe" | "warning" | "danger";
export type BudgetStatus = "active" | "exceeded";
export type SavingsGoalStatus = "active" | "completed";

// ============= CORE MODELS =============
export interface User {
  id: string;
  email: string;
  displayName: string;
  preferredCurrency: string;
  createdAt: string;
  isOnboarded: boolean;
}

export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  class: AccountClass;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  status: "active" | "archived";
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  group: CategoryGroup;
  status: "active" | "disabled";
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId?: string;
  counterpartyAccountId?: string;
  savingsGoalId?: string;
  date: string;
  notes?: string;
  createdAt: string;
  editedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  actorId: string;
  actionType: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  diff: unknown;
  timestamp: string;
}

export interface BackdatedTransactionImpact {
  isBackdated: boolean;
  affectedPeriod: string;
  currentPeriod: string;
  hadReportedSnapshot: boolean;
  message?: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  monthPeriod: string; // YYYY-MM
  limitAmount: number;
  spentAmount: number;
  status: BudgetStatus;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  sourceAccountId?: string;
  status: SavingsGoalStatus;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  interval: "monthly" | "weekly";
  nextDueDate: string;
  active: boolean;
}

export interface SafeSpendingSnapshot {
  id?: string;
  userId?: string;
  periodMonth?: string;
  capturedAt?: string;
  createdAt?: string;
  totalAssets: number;
  totalLiabilities: number;
  pendingRoutineExpenses: number;
  savingsAllocation: number;
  priorityBudgetReserve: number;
  safeSpending: number;
  status: FinancialStatus;
  components: { label: string; amount: number }[];
}