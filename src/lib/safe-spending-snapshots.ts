import { calculateSafeSpending } from "./safe-spending.ts";
import type { Budget, FinancialAccount, RecurringExpense, SafeSpendingSnapshot, SavingsGoal } from "./types";

export type SnapshotRecord = {
  id: string;
  userId: string;
  periodMonth: string;
  capturedAt: Date;
  createdAt: Date;
  totalAssets: unknown;
  totalLiabilities: unknown;
  pendingRoutineExpenses: unknown;
  savingsAllocation: unknown;
  priorityBudgetReserve: unknown;
  safeSpending: unknown;
  status: SafeSpendingSnapshot["status"];
  components: unknown;
};

export type SnapshotCreateData = {
  userId: string;
  periodMonth: string;
  capturedAt: Date;
  totalAssets: number;
  totalLiabilities: number;
  pendingRoutineExpenses: number;
  savingsAllocation: number;
  priorityBudgetReserve: number;
  safeSpending: number;
  status: SafeSpendingSnapshot["status"];
  components: SafeSpendingSnapshot["components"];
};

export type SnapshotClient = {
  safeSpendingSnapshot: {
    create(args: { data: SnapshotCreateData }): Promise<SnapshotRecord>;
    findFirst(args: { where: { userId: string }; orderBy: { capturedAt: "desc" } }): Promise<SnapshotRecord | null>;
  };
};

export type SafeSpendingSnapshotInputs = {
  accounts: FinancialAccount[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value ?? 0);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapComponents(value: unknown): SafeSpendingSnapshot["components"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((component) => {
      if (!component || typeof component !== "object") return null;
      const raw = component as { label?: unknown; amount?: unknown };
      return {
        label: String(raw.label ?? ""),
        amount: toNumber(raw.amount),
      };
    })
    .filter((component): component is SafeSpendingSnapshot["components"][number] => Boolean(component?.label));
}

export function buildSafeSpendingSnapshotPayload(
  inputs: SafeSpendingSnapshotInputs,
  capturedAt = new Date()
): Omit<SnapshotCreateData, "userId"> {
  const snapshot = calculateSafeSpending(
    inputs.accounts,
    inputs.budgets,
    inputs.savingsGoals,
    inputs.recurringExpenses,
    capturedAt
  );

  return {
    periodMonth: capturedAt.toISOString().slice(0, 7),
    capturedAt,
    totalAssets: snapshot.totalAssets,
    totalLiabilities: snapshot.totalLiabilities,
    pendingRoutineExpenses: snapshot.pendingRoutineExpenses,
    savingsAllocation: snapshot.savingsAllocation,
    priorityBudgetReserve: snapshot.priorityBudgetReserve,
    safeSpending: snapshot.safeSpending,
    status: snapshot.status,
    components: snapshot.components.map((component) => ({
      label: component.label,
      amount: component.amount,
    })),
  };
}

export function mapSafeSpendingSnapshotRecord(record: SnapshotRecord): SafeSpendingSnapshot {
  return {
    id: record.id,
    userId: record.userId,
    periodMonth: record.periodMonth,
    capturedAt: toIsoString(record.capturedAt),
    createdAt: toIsoString(record.createdAt),
    totalAssets: toNumber(record.totalAssets),
    totalLiabilities: toNumber(record.totalLiabilities),
    pendingRoutineExpenses: toNumber(record.pendingRoutineExpenses),
    savingsAllocation: toNumber(record.savingsAllocation),
    priorityBudgetReserve: toNumber(record.priorityBudgetReserve),
    safeSpending: toNumber(record.safeSpending),
    status: record.status,
    components: mapComponents(record.components),
  };
}

export async function saveSafeSpendingSnapshot(
  userId: string,
  inputs: SafeSpendingSnapshotInputs,
  options: { capturedAt?: Date; client?: SnapshotClient } = {}
) {
  const client = options.client ?? ((await import("./prisma")).prisma as unknown as SnapshotClient);
  const payload = buildSafeSpendingSnapshotPayload(inputs, options.capturedAt);
  const record = await client.safeSpendingSnapshot.create({
    data: {
      userId,
      ...payload,
    },
  });

  return mapSafeSpendingSnapshotRecord(record);
}

export async function getLatestSafeSpendingSnapshot(
  userId: string,
  options: { client?: SnapshotClient } = {}
) {
  const client = options.client ?? ((await import("./prisma")).prisma as unknown as SnapshotClient);
  const record = await client.safeSpendingSnapshot.findFirst({
    where: { userId },
    orderBy: { capturedAt: "desc" },
  });

  return record ? mapSafeSpendingSnapshotRecord(record) : null;
}
