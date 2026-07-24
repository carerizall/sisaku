import assert from "node:assert/strict";
import test from "node:test";
import { calculateAccountBalances, calculateSafeSpending } from "./safe-spending.ts";
import type { Budget, FinancialAccount, RecurringExpense, SavingsGoal, Transaction } from "./types.ts";

const baseAccount = (account: Partial<FinancialAccount> & Pick<FinancialAccount, "id" | "class" | "initialBalance">): FinancialAccount => ({
  userId: "u1",
  name: account.id,
  type: account.class === "liability" ? "credit_card" : "bank",
  currentBalance: account.initialBalance,
  currency: "IDR",
  status: "active",
  createdAt: "2026-07-01T00:00:00.000Z",
  ...account,
});

test("MVP safe spending formula follows PRD components", () => {
  const budgets: Budget[] = [{ id: "b1", userId: "u1", categoryId: "needs", monthPeriod: "2026-07", limitAmount: 1_000_000, spentAmount: 500_000, status: "active" }];
  const goals: SavingsGoal[] = [{ id: "g1", userId: "u1", name: "Dana darurat", targetAmount: 3_000_000, savedAmount: 0, targetDate: "2026-10-13T00:00:00.000Z", status: "active" }];
  const recurring: RecurringExpense[] = [{ id: "r1", userId: "u1", name: "Sewa", amount: 1_500_000, categoryId: "tagihan", interval: "monthly", nextDueDate: "2026-07-25T00:00:00.000Z", active: true }];

  const snapshot = calculateSafeSpending(
    [baseAccount({ id: "bank", class: "asset", initialBalance: 9_000_000, currentBalance: 9_000_000 }), baseAccount({ id: "cc", class: "liability", initialBalance: 1_000_000, currentBalance: 1_000_000 })],
    budgets,
    goals,
    recurring,
    new Date("2026-07-15T00:00:00.000Z")
  );

  assert.equal(snapshot.safeSpending, 5_000_000);
  assert.equal(snapshot.status, "safe");
});

test("credit card expense increases liability and card payment transfer reduces it without becoming expense", () => {
  const accounts = [baseAccount({ id: "bank", class: "asset", initialBalance: 5_000_000 }), baseAccount({ id: "cc", class: "liability", initialBalance: 1_000_000 })];
  const transactions: Transaction[] = [
    { id: "t1", userId: "u1", accountId: "cc", type: "expense", amount: 200_000, currency: "IDR", date: "2026-07-10T00:00:00.000Z", createdAt: "2026-07-10T00:00:00.000Z" },
    { id: "t2", userId: "u1", accountId: "bank", counterpartyAccountId: "cc", type: "transfer", amount: 300_000, currency: "IDR", date: "2026-07-11T00:00:00.000Z", createdAt: "2026-07-11T00:00:00.000Z" },
  ];

  const [bank, creditCard] = calculateAccountBalances(accounts, transactions);
  assert.equal(bank.currentBalance, 4_700_000);
  assert.equal(creditCard.currentBalance, 900_000);
  assert.equal(transactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0), 200_000);
});