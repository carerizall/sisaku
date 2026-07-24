import { prisma } from "@/lib/prisma";
import type {
  AccountClass,
  AccountType,
  Budget,
  Category,
  FinancialAccount,
  RecurringExpense,
  SavingsGoal,
  Transaction,
} from "@prisma/client";
import { getAccountTransactionDelta } from "@/lib/safe-spending";
import { saveSafeSpendingSnapshot } from "@/lib/safe-spending-snapshots";
import { refreshBackdatedSafeSpendingSnapshot, type BackdatedTransactionImpact } from "@/lib/backdated";

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Gaji", icon: "💼", color: "#10b981", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Freelance", icon: "💻", color: "#3b82f6", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Bonus", icon: "🎁", color: "#f59e0b", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Hadiah", icon: "🎉", color: "#ec4899", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Refund", icon: "↩️", color: "#8b5cf6", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Lainnya", icon: "📥", color: "#6b7280", type: "income", group: "other", status: "active", isDefault: true },
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Makan", icon: "🍜", color: "#ef4444", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { name: "Transportasi", icon: "🚗", color: "#3b82f6", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Belanja", icon: "🛍️", color: "#ec4899", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { name: "Hiburan", icon: "🎮", color: "#8b5cf6", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { name: "Tagihan", icon: "🧾", color: "#f59e0b", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Kesehatan", icon: "🏥", color: "#10b981", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Pendidikan", icon: "📚", color: "#06b6d4", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Keluarga", icon: "👨‍👩‍👧", color: "#f97316", type: "expense", group: "other", status: "active", isDefault: true },
  { name: "Langganan", icon: "📱", color: "#6366f1", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Lainnya", icon: "📤", color: "#6b7280", type: "expense", group: "other", status: "active", isDefault: true },
] as const;

export const DEFAULT_CATEGORIES = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES] as const;

export function accountClassForType(type: AccountType): AccountClass {
  return type === "credit_card" ? "liability" : "asset";
}

export function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value ?? 0);
}

export function mapAccount(account: FinancialAccount) {
  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    class: account.class,
    initialBalance: toNumber(account.initialBalance),
    currentBalance: toNumber(account.currentBalance),
    currency: account.currency,
    status: account.status,
    createdAt: account.createdAt.toISOString(),
  };
}

export function mapCategory(category: Category) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
    group: category.group,
    status: category.status,
    isDefault: category.isDefault,
  };
}

export function mapTransaction(transaction: Transaction) {
  return {
    id: transaction.id,
    userId: transaction.userId,
    accountId: transaction.accountId,
    type: transaction.type,
    amount: toNumber(transaction.amount),
    currency: transaction.currency,
    categoryId: transaction.categoryId ?? undefined,
    counterpartyAccountId: transaction.counterpartyAccountId ?? undefined,
    savingsGoalId: transaction.savingsGoalId ?? undefined,
    date: transaction.date.toISOString(),
    notes: transaction.notes ?? undefined,
    createdAt: transaction.createdAt.toISOString(),
    editedAt: transaction.editedAt?.toISOString(),
  };
}

export function mapBudget(budget: Budget, spentAmount = 0) {
  const status: "active" | "exceeded" = spentAmount > toNumber(budget.limitAmount) ? "exceeded" : "active";

  return {
    id: budget.id,
    userId: budget.userId,
    categoryId: budget.categoryId,
    monthPeriod: budget.monthPeriod,
    limitAmount: toNumber(budget.limitAmount),
    spentAmount,
    status,
  };
}

export function mapSavingsGoal(goal: SavingsGoal, savedAmount = 0) {
  const status: "active" | "completed" = savedAmount >= toNumber(goal.targetAmount) ? "completed" : "active";

  return {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    targetAmount: toNumber(goal.targetAmount),
    savedAmount,
    targetDate: goal.targetDate.toISOString(),
    sourceAccountId: goal.sourceAccountId ?? undefined,
    status,
  };
}

export function mapRecurringExpense(expense: RecurringExpense) {
  return {
    id: expense.id,
    userId: expense.userId,
    name: expense.name,
    amount: toNumber(expense.amount),
    categoryId: expense.categoryId,
    interval: expense.interval,
    nextDueDate: expense.nextDueDate.toISOString(),
    active: expense.active,
  };
}

export async function ensureDefaultCategories(userId: string) {
  const categoryCount = await prisma.category.count({ where: { userId } });
  if (categoryCount > 0) return;

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId })),
    skipDuplicates: true,
  });
}

export async function recalculateUserAccountBalances(userId: string) {
  const accounts = await prisma.financialAccount.findMany({ where: { userId } });
  const transactions = await prisma.transaction.findMany({ where: { userId, deletedAt: null } });

  for (const account of accounts) {
    let balance = toNumber(account.initialBalance);

    for (const tx of transactions) {
      balance += getAccountTransactionDelta(account, { ...tx, amount: toNumber(tx.amount), counterpartyAccountId: tx.counterpartyAccountId ?? undefined });
    }

    await prisma.financialAccount.update({ where: { id: account.id }, data: { currentBalance: balance } });
  }
}

export async function getFinanceBootstrap(userId: string, options: { backdatedTransactionDate?: Date } = {}) {
  await ensureDefaultCategories(userId);
  await recalculateUserAccountBalances(userId);

  const [accounts, categories, transactions, budgets, savingsGoals, recurringExpenses] = await Promise.all([
    prisma.financialAccount.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }] }),
    prisma.transaction.findMany({ where: { userId, deletedAt: null }, orderBy: { date: "desc" } }),
    prisma.budget.findMany({ where: { userId }, orderBy: [{ monthPeriod: "desc" }, { createdAt: "asc" }] }),
    prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.recurringExpense.findMany({ where: { userId }, orderBy: { nextDueDate: "asc" } }),
  ]);

  const expenseTransactions = transactions.filter((tx) => tx.type === "expense" && tx.categoryId);
  const savingsTransactions = transactions.filter((tx) => tx.type === "savings" && tx.savingsGoalId);

  const bootstrap = {
    accounts: accounts.map(mapAccount),
    categories: categories.map(mapCategory),
    transactions: transactions.map(mapTransaction),
    budgets: budgets.map((budget) => {
      const spentAmount = expenseTransactions
        .filter((tx) => tx.categoryId === budget.categoryId && tx.date.toISOString().slice(0, 7) === budget.monthPeriod)
        .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
      return mapBudget(budget, spentAmount);
    }),
    savingsGoals: savingsGoals.map((goal) => {
      const savedAmount = savingsTransactions
        .filter((tx) => tx.savingsGoalId === goal.id)
        .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
      return mapSavingsGoal(goal, savedAmount);
    }),
    recurringExpenses: recurringExpenses.map(mapRecurringExpense),
  };

  const safeSpending = await saveSafeSpendingSnapshot(userId, {
    accounts: bootstrap.accounts,
    budgets: bootstrap.budgets,
    savingsGoals: bootstrap.savingsGoals,
    recurringExpenses: bootstrap.recurringExpenses,
  });

  let backdatedImpact: BackdatedTransactionImpact | undefined;
  if (options.backdatedTransactionDate) {
    const refreshed = await refreshBackdatedSafeSpendingSnapshot(
      userId,
      options.backdatedTransactionDate,
      {
        accounts: bootstrap.accounts,
        budgets: bootstrap.budgets,
        savingsGoals: bootstrap.savingsGoals,
        recurringExpenses: bootstrap.recurringExpenses,
      },
      { client: prisma as never }
    );
    backdatedImpact = refreshed.impact;
  }

  return {
    ...bootstrap,
    safeSpending,
    backdatedImpact,
  };
}