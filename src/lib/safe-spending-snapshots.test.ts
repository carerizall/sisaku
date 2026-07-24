import assert from "node:assert/strict";
import test from "node:test";
import { buildSafeSpendingSnapshotPayload, saveSafeSpendingSnapshot } from "./safe-spending-snapshots.ts";
import type { SnapshotClient, SnapshotCreateData } from "./safe-spending-snapshots.ts";
import type { Budget, FinancialAccount, RecurringExpense, SavingsGoal } from "./types.ts";

const capturedAt = new Date("2026-07-15T00:00:00.000Z");

const accounts: FinancialAccount[] = [
  {
    id: "bank",
    userId: "u1",
    name: "Bank",
    type: "bank",
    class: "asset",
    initialBalance: 9_000_000,
    currentBalance: 9_000_000,
    currency: "IDR",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cc",
    userId: "u1",
    name: "Kartu Kredit",
    type: "credit_card",
    class: "liability",
    initialBalance: 1_000_000,
    currentBalance: 1_000_000,
    currency: "IDR",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

const budgets: Budget[] = [
  { id: "b1", userId: "u1", categoryId: "needs", monthPeriod: "2026-07", limitAmount: 1_000_000, spentAmount: 500_000, status: "active" },
];

const savingsGoals: SavingsGoal[] = [
  { id: "g1", userId: "u1", name: "Dana darurat", targetAmount: 3_000_000, savedAmount: 0, targetDate: "2026-10-13T00:00:00.000Z", status: "active" },
];

const recurringExpenses: RecurringExpense[] = [
  { id: "r1", userId: "u1", name: "Sewa", amount: 1_500_000, categoryId: "tagihan", interval: "monthly", nextDueDate: "2026-07-25T00:00:00.000Z", active: true },
];

test("buildSafeSpendingSnapshotPayload records period, capturedAt, formula output, and explainable components", () => {
  const payload = buildSafeSpendingSnapshotPayload({ accounts, budgets, savingsGoals, recurringExpenses }, capturedAt);

  assert.equal(payload.periodMonth, "2026-07");
  assert.equal(payload.capturedAt, capturedAt);
  assert.equal(payload.safeSpending, 5_000_000);
  assert.equal(payload.status, "safe");
  assert.deepEqual(payload.components.map((component) => component.label), [
    "Total Aset Aktif",
    "Total Kewajiban Aktif",
    "Pengeluaran Rutin Tertunda",
    "Alokasi Target Tabungan",
    "Sisa Anggaran Prioritas",
  ]);
});

test("saveSafeSpendingSnapshot persists and maps latest snapshot shape for dashboard bootstrap", async () => {
  const createdAt = new Date("2026-07-15T00:00:01.000Z");
  const writes: SnapshotCreateData[] = [];
  const client: SnapshotClient = {
    safeSpendingSnapshot: {
      async create({ data }) {
        writes.push(data);
        return {
          id: "snapshot-1",
          createdAt,
          ...data,
        };
      },
      async findFirst() {
        return null;
      },
    },
  };

  const snapshot = await saveSafeSpendingSnapshot("u1", { accounts, budgets, savingsGoals, recurringExpenses }, { capturedAt, client });

  assert.equal(writes.length, 1);
  assert.equal(snapshot.id, "snapshot-1");
  assert.equal(snapshot.userId, "u1");
  assert.equal(snapshot.periodMonth, "2026-07");
  assert.equal(snapshot.capturedAt, "2026-07-15T00:00:00.000Z");
  assert.equal(snapshot.createdAt, "2026-07-15T00:00:01.000Z");
  assert.equal(snapshot.safeSpending, 5_000_000);
  assert.equal(snapshot.components.length, 5);
});