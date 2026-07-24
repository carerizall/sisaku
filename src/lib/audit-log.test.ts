import assert from "node:assert/strict";
import test from "node:test";
import { getChangedFields, mapAuditLog, recordAuditLog, type AuditLogInput } from "./audit-log.ts";

test("getChangedFields returns only changed values for audit diff", () => {
  assert.deepEqual(
    getChangedFields(
      { amount: "10000", notes: "lama", categoryId: "food" },
      { amount: "15000", notes: "lama", categoryId: null }
    ),
    {
      amount: { before: "10000", after: "15000" },
      categoryId: { before: "food", after: null },
    }
  );
});

test("recordAuditLog persists and maps audit log shape", async () => {
  const input: AuditLogInput = {
    userId: "user-1",
    actorId: "user-1",
    actionType: "transaction_created",
    targetType: "transaction",
    targetId: "tx-1",
    diff: { after: { amount: 50000 } },
  };

  const log = await recordAuditLog(input, {
    auditLog: {
      async create(args) {
        assert.deepEqual(args.data, input);
        return { id: "audit-1", ...args.data, timestamp: new Date("2026-07-24T00:00:00.000Z") };
      },
    },
  });

  assert.deepEqual(log, {
    id: "audit-1",
    userId: "user-1",
    actorId: "user-1",
    actionType: "transaction_created",
    targetType: "transaction",
    targetId: "tx-1",
    diff: { after: { amount: 50000 } },
    timestamp: "2026-07-24T00:00:00.000Z",
  });
});

test("mapAuditLog exposes timestamp as ISO string", () => {
  assert.equal(
    mapAuditLog({
      id: "audit-2",
      userId: "user-1",
      actorId: "user-1",
      actionType: "account_archived",
      targetType: "account",
      targetId: "account-1",
      diff: { status: { before: "active", after: "archived" } },
      timestamp: new Date("2026-07-24T01:02:03.000Z"),
    }).timestamp,
    "2026-07-24T01:02:03.000Z"
  );
});