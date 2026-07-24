import assert from "node:assert/strict";
import test from "node:test";
import { buildMonthlyReport, getPreviousMonthPeriod } from "./reports.ts";
import type { Category, FinancialAccount, Transaction } from "./types.ts";

const categories: Category[] = [
  { id: "food", userId: "u1", name: "Makan", icon: "🍜", color: "#ef4444", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { id: "transport", userId: "u1", name: "Transportasi", icon: "🚗", color: "#3b82f6", type: "expense", group: "needs", status: "active", isDefault: true },
  { id: "salary", userId: "u1", name: "Gaji", icon: "💼", color: "#10b981", type: "income", group: "other", status: "active", isDefault: true },
];

const accounts: FinancialAccount[] = [
  {
    id: "bank",
    userId: "u1",
    name: "Bank Utama",
    type: "bank",
    class: "asset",
    initialBalance: 0,
    currentBalance: 0,
    currency: "IDR",
    status: "active",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "credit-card",
    userId: "u1",
    name: "Kartu Kredit",
    type: "credit_card",
    class: "liability",
    initialBalance: 0,
    currentBalance: 0,
    currency: "IDR",
    status: "active",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
];

const tx = (transaction: Partial<Transaction> & Pick<Transaction, "id" | "type" | "amount" | "date">): Transaction => ({
  userId: "u1",
  accountId: "bank",
  currency: "IDR",
  createdAt: transaction.date,
  ...transaction,
});

test("getPreviousMonthPeriod handles month and year boundary", () => {
  assert.equal(getPreviousMonthPeriod("2026-07"), "2026-06");
  assert.equal(getPreviousMonthPeriod("2026-01"), "2025-12");
});

test("buildMonthlyReport calculates monthly summary, category chart, comparison, and simple insights", () => {
  const transactions: Transaction[] = [
    tx({ id: "jul-income", type: "income", amount: 5_000_000, categoryId: "salary", date: "2026-07-01T00:00:00.000Z" }),
    tx({ id: "jul-food-1", type: "expense", amount: 1_000_000, categoryId: "food", date: "2026-07-03T00:00:00.000Z" }),
    tx({ id: "jul-food-2", type: "expense", amount: 250_000, categoryId: "food", date: "2026-07-04T00:00:00.000Z" }),
    tx({ id: "jul-transport", type: "expense", amount: 500_000, categoryId: "transport", date: "2026-07-05T00:00:00.000Z" }),
    tx({ id: "jul-savings", type: "savings", amount: 700_000, savingsGoalId: "goal", date: "2026-07-06T00:00:00.000Z" }),
    tx({ id: "jul-transfer", type: "transfer", amount: 1_000_000, counterpartyAccountId: "ewallet", date: "2026-07-07T00:00:00.000Z" }),
    tx({ id: "jul-credit-card-payment", type: "transfer", amount: 2_000_000, counterpartyAccountId: "credit-card", date: "2026-07-08T00:00:00.000Z", notes: "Bayar kartu kredit" }),
    tx({ id: "jun-income", type: "income", amount: 4_000_000, categoryId: "salary", date: "2026-06-01T00:00:00.000Z" }),
    tx({ id: "jun-food", type: "expense", amount: 800_000, categoryId: "food", date: "2026-06-03T00:00:00.000Z" }),
    tx({ id: "jun-savings", type: "savings", amount: 500_000, savingsGoalId: "goal", date: "2026-06-06T00:00:00.000Z" }),
  ];

  const report = buildMonthlyReport(transactions, categories, accounts, "2026-07");

  assert.deepEqual(report.summary, {
    totalIncome: 5_000_000,
    totalExpense: 1_750_000,
    totalSavings: 700_000,
    totalAdjustment: 0,
    netChange: 2_550_000,
  });
  assert.equal(report.previousMonthPeriod, "2026-06");
  assert.equal(report.comparison.incomeDelta, 1_000_000);
  assert.equal(report.comparison.expenseDelta, 950_000);
  assert.equal(report.comparison.savingsDelta, 200_000);
  assert.equal(report.expensesByCategory[0]?.name, "Makan");
  assert.equal(report.expensesByCategory[0]?.amount, 1_250_000);
  assert.equal(Math.round(report.expensesByCategory[0]?.percentage ?? 0), 71);
  assert.equal(report.accountUsage.find((account) => account.accountId === "bank")?.transactionCount, 7);
  assert.match(report.insights[0] ?? "", /Pengeluaran makan kamu paling besar bulan ini/);
  assert.match(report.insights[0] ?? "", /71% dari total pengeluaran/);
});