import assert from "node:assert/strict";
import test from "node:test";
import { assessBackdatedTransactionImpact, getMonthPeriod } from "./backdated.ts";

test("getMonthPeriod extracts YYYY-MM from Date or string", () => {
  assert.equal(getMonthPeriod(new Date("2026-06-15T10:00:00.000Z")), "2026-06");
  assert.equal(getMonthPeriod("2026-07-01T00:00:00.000Z"), "2026-07");
});

test("assessBackdatedTransactionImpact warns when previous period already has snapshot", async () => {
  const impact = await assessBackdatedTransactionImpact("user-1", new Date("2026-06-15T00:00:00.000Z"), {
    now: new Date("2026-07-24T00:00:00.000Z"),
    client: {
      safeSpendingSnapshot: {
        async findFirst(args) {
          assert.deepEqual(args.where, { userId: "user-1", periodMonth: "2026-06" });
          return {
            id: "snapshot-1",
            userId: "user-1",
            periodMonth: "2026-06",
            capturedAt: new Date(),
            createdAt: new Date(),
            totalAssets: 0,
            totalLiabilities: 0,
            pendingRoutineExpenses: 0,
            savingsAllocation: 0,
            priorityBudgetReserve: 0,
            safeSpending: 0,
            status: "safe",
            components: [],
          };
        },
        async create() {
          throw new Error("not used");
        },
      },
    },
  });

  assert.equal(impact.isBackdated, true);
  assert.equal(impact.affectedPeriod, "2026-06");
  assert.equal(impact.currentPeriod, "2026-07");
  assert.equal(impact.hadReportedSnapshot, true);
  assert.match(impact.message ?? "", /sudah memiliki snapshot/);
});

test("assessBackdatedTransactionImpact ignores current-period transaction", async () => {
  const impact = await assessBackdatedTransactionImpact("user-1", new Date("2026-07-01T00:00:00.000Z"), {
    now: new Date("2026-07-24T00:00:00.000Z"),
    client: {
      safeSpendingSnapshot: {
        async findFirst() {
          throw new Error("not used");
        },
        async create() {
          throw new Error("not used");
        },
      },
    },
  });

  assert.deepEqual(impact, {
    isBackdated: false,
    affectedPeriod: "2026-07",
    currentPeriod: "2026-07",
    hadReportedSnapshot: false,
    message: undefined,
  });
});