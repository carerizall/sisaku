import type { Budget, FinancialAccount, RecurringExpense, SafeSpendingSnapshot, SavingsGoal, Transaction } from "./types";
import { getLocalMonthPeriod } from "./timezone.ts";

type EngineAccount = Pick<FinancialAccount, "id" | "class" | "initialBalance" | "currentBalance" | "status">;
type EngineTransaction = Pick<Transaction, "accountId" | "counterpartyAccountId" | "type" | "amount">;
type EngineBudget = Pick<Budget, "monthPeriod" | "limitAmount" | "spentAmount">;
type EngineSavingsGoal = Pick<SavingsGoal, "targetAmount" | "savedAmount" | "targetDate" | "status">;
type EngineRecurringExpense = Pick<RecurringExpense, "amount" | "nextDueDate" | "active">;

export function getAccountTransactionDelta(account: Pick<EngineAccount, "id" | "class">, tx: EngineTransaction) {
  const amount = Math.abs(Number(tx.amount || 0));
  let delta = 0;

  if (tx.accountId === account.id) {
    if (tx.type === "income") delta += account.class === "liability" ? -amount : amount;
    if (tx.type === "expense" || tx.type === "savings") delta += account.class === "liability" ? amount : -amount;
    if (tx.type === "transfer") delta += account.class === "liability" ? amount : -amount;
    if (tx.type === "adjustment") delta += Number(tx.amount || 0);
  }

  if (tx.counterpartyAccountId === account.id && tx.type === "transfer") {
    delta += account.class === "liability" ? -amount : amount;
  }

  return delta;
}

export function calculateAccountCurrentBalance(account: EngineAccount, transactions: EngineTransaction[]) {
  return transactions.reduce((balance, tx) => balance + getAccountTransactionDelta(account, tx), account.initialBalance);
}

export function calculateAccountBalances<T extends EngineAccount>(accounts: T[], transactions: EngineTransaction[]) {
  return accounts.map((account) => ({
    ...account,
    currentBalance: calculateAccountCurrentBalance(account, transactions),
  }));
}

export function calculateSafeSpending(
  accounts: EngineAccount[],
  budgets: EngineBudget[],
  savingsGoals: EngineSavingsGoal[],
  recurringExpenses: EngineRecurringExpense[],
  today = new Date()
): SafeSpendingSnapshot {
  const activeAccounts = accounts.filter((account) => account.status === "active");
  const totalAssets = activeAccounts
    .filter((account) => account.class === "asset")
    .reduce((sum, account) => sum + account.currentBalance, 0);
  const totalLiabilities = activeAccounts
    .filter((account) => account.class === "liability")
    .reduce((sum, account) => sum + account.currentBalance, 0);

  const periodMonth = getLocalMonthPeriod(today);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  const pendingRoutineExpenses = recurringExpenses
    .filter((expense) => expense.active)
    .filter((expense) => {
      const due = new Date(expense.nextDueDate);
      return due >= today && due <= endOfMonth;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const savingsAllocation = savingsGoals
    .filter((goal) => goal.status === "active")
    .reduce((sum, goal) => {
      const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
      const target = new Date(goal.targetDate);
      const monthsLeft = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return sum + remaining / monthsLeft;
    }, 0);

  const priorityBudgetReserve = budgets
    .filter((budget) => budget.monthPeriod === periodMonth)
    .reduce((sum, budget) => sum + Math.max(0, budget.limitAmount - budget.spentAmount), 0);

  const safeSpending = totalAssets - totalLiabilities - pendingRoutineExpenses - savingsAllocation - priorityBudgetReserve;
  const status = safeSpending < 0 ? "danger" : totalAssets > 0 && safeSpending < totalAssets * 0.2 ? "warning" : "safe";

  return {
    totalAssets,
    totalLiabilities,
    pendingRoutineExpenses,
    savingsAllocation,
    priorityBudgetReserve,
    safeSpending,
    status,
    components: [
      { label: "Total Aset Aktif", amount: totalAssets },
      { label: "Total Kewajiban Aktif", amount: -totalLiabilities },
      { label: "Pengeluaran Rutin Tertunda", amount: -pendingRoutineExpenses },
      { label: "Alokasi Target Tabungan", amount: -savingsAllocation },
      { label: "Sisa Anggaran Prioritas", amount: -priorityBudgetReserve },
    ],
  };
}