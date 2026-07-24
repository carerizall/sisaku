import { formatRupiah } from "./utils.ts";
import type { Category, FinancialAccount, Transaction } from "./types";

export interface MonthlyReportSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  totalAdjustment: number;
  netChange: number;
}

export interface ExpenseCategoryReportItem {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface AccountUsageReportItem {
  accountId: string;
  name: string;
  income: number;
  expense: number;
  savings: number;
  transactionCount: number;
}

export interface MonthlyReportComparison {
  incomeDelta: number;
  expenseDelta: number;
  savingsDelta: number;
  netChangeDelta: number;
  expensePercentChange: number | null;
}

export interface MonthlyReport {
  monthPeriod: string;
  previousMonthPeriod: string;
  summary: MonthlyReportSummary;
  previousSummary: MonthlyReportSummary;
  comparison: MonthlyReportComparison;
  expensesByCategory: ExpenseCategoryReportItem[];
  accountUsage: AccountUsageReportItem[];
  insights: string[];
}

const emptySummary = (): MonthlyReportSummary => ({
  totalIncome: 0,
  totalExpense: 0,
  totalSavings: 0,
  totalAdjustment: 0,
  netChange: 0,
});

export function getPreviousMonthPeriod(monthPeriod: string): string {
  const [year = "0", month = "1"] = monthPeriod.split("-");
  const date = new Date(Number(year), Number(month) - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isInMonth(transaction: Pick<Transaction, "date">, monthPeriod: string): boolean {
  return transaction.date.slice(0, 7) === monthPeriod;
}

function calculateMonthlySummary(transactions: Transaction[], monthPeriod: string): MonthlyReportSummary {
  const summary = transactions.filter((transaction) => isInMonth(transaction, monthPeriod)).reduce((result, transaction) => {
    if (transaction.type === "income") result.totalIncome += transaction.amount;
    if (transaction.type === "expense") result.totalExpense += transaction.amount;
    if (transaction.type === "savings") result.totalSavings += transaction.amount;
    if (transaction.type === "adjustment") result.totalAdjustment += transaction.amount;
    return result;
  }, emptySummary());

  return {
    ...summary,
    netChange: summary.totalIncome - summary.totalExpense - summary.totalSavings + summary.totalAdjustment,
  };
}

function calculatePercentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function buildExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  monthPeriod: string,
  totalExpense: number
): ExpenseCategoryReportItem[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const groups = new Map<string, { amount: number; transactionCount: number }>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense" || !isInMonth(transaction, monthPeriod)) continue;
    const categoryId = transaction.categoryId ?? "unknown";
    const current = groups.get(categoryId) ?? { amount: 0, transactionCount: 0 };
    groups.set(categoryId, {
      amount: current.amount + transaction.amount,
      transactionCount: current.transactionCount + 1,
    });
  }

  return [...groups.entries()]
    .map(([categoryId, value]) => {
      const category = categoryById.get(categoryId);
      return {
        categoryId,
        name: category?.name ?? "Lainnya",
        icon: category?.icon ?? "📤",
        color: category?.color ?? "#64748b",
        amount: value.amount,
        percentage: totalExpense > 0 ? (value.amount / totalExpense) * 100 : 0,
        transactionCount: value.transactionCount,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

function buildAccountUsage(transactions: Transaction[], accounts: FinancialAccount[], monthPeriod: string): AccountUsageReportItem[] {
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const groups = new Map<string, Omit<AccountUsageReportItem, "accountId" | "name">>();

  for (const transaction of transactions) {
    if (!isInMonth(transaction, monthPeriod)) continue;
    const current = groups.get(transaction.accountId) ?? { income: 0, expense: 0, savings: 0, transactionCount: 0 };
    groups.set(transaction.accountId, {
      income: current.income + (transaction.type === "income" ? transaction.amount : 0),
      expense: current.expense + (transaction.type === "expense" ? transaction.amount : 0),
      savings: current.savings + (transaction.type === "savings" ? transaction.amount : 0),
      transactionCount: current.transactionCount + 1,
    });
  }

  return [...groups.entries()]
    .map(([accountId, value]) => ({
      accountId,
      name: accountById.get(accountId)?.name ?? "Tidak diketahui",
      ...value,
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount || b.expense - a.expense);
}

function buildSimpleInsights(
  summary: MonthlyReportSummary,
  previousSummary: MonthlyReportSummary,
  expensesByCategory: ExpenseCategoryReportItem[]
): string[] {
  const insights: string[] = [];
  const topExpense = expensesByCategory[0];

  if (topExpense && summary.totalExpense > 0) {
    insights.push(
      `Pengeluaran ${topExpense.name.toLowerCase()} kamu paling besar bulan ini, yaitu ${formatRupiah(topExpense.amount)} atau ${Math.round(topExpense.percentage)}% dari total pengeluaran.`
    );
  } else {
    insights.push("Belum ada pengeluaran bulan ini, jadi laporan kategori masih kosong.");
  }

  const expenseDelta = summary.totalExpense - previousSummary.totalExpense;
  const expensePercentChange = calculatePercentChange(summary.totalExpense, previousSummary.totalExpense);
  if (expensePercentChange === null) {
    insights.push("Belum ada pembanding pengeluaran dari bulan sebelumnya.");
  } else if (expenseDelta > 0) {
    insights.push(`Pengeluaran bulan ini naik ${Math.round(expensePercentChange)}% dibanding bulan sebelumnya.`);
  } else if (expenseDelta < 0) {
    insights.push(`Pengeluaran bulan ini turun ${Math.abs(Math.round(expensePercentChange))}% dibanding bulan sebelumnya.`);
  } else {
    insights.push("Pengeluaran bulan ini sama dengan bulan sebelumnya.");
  }

  if (summary.totalSavings > 0) {
    insights.push(`Kamu sudah menyisihkan ${formatRupiah(summary.totalSavings)} untuk tabungan bulan ini.`);
  } else {
    insights.push("Belum ada transaksi tabungan bulan ini. Jika memungkinkan, sisihkan nominal kecil secara rutin.");
  }

  return insights;
}

export function buildMonthlyReport(
  transactions: Transaction[],
  categories: Category[],
  accounts: FinancialAccount[],
  monthPeriod: string
): MonthlyReport {
  const previousMonthPeriod = getPreviousMonthPeriod(monthPeriod);
  const summary = calculateMonthlySummary(transactions, monthPeriod);
  const previousSummary = calculateMonthlySummary(transactions, previousMonthPeriod);
  const expensesByCategory = buildExpensesByCategory(transactions, categories, monthPeriod, summary.totalExpense);

  return {
    monthPeriod,
    previousMonthPeriod,
    summary,
    previousSummary,
    comparison: {
      incomeDelta: summary.totalIncome - previousSummary.totalIncome,
      expenseDelta: summary.totalExpense - previousSummary.totalExpense,
      savingsDelta: summary.totalSavings - previousSummary.totalSavings,
      netChangeDelta: summary.netChange - previousSummary.netChange,
      expensePercentChange: calculatePercentChange(summary.totalExpense, previousSummary.totalExpense),
    },
    expensesByCategory,
    accountUsage: buildAccountUsage(transactions, accounts, monthPeriod),
    insights: buildSimpleInsights(summary, previousSummary, expensesByCategory),
  };
}