import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.ts";

export type AuditActionType = "transaction_created" | "transaction_updated" | "transaction_deleted" | "adjustment_recorded" | "account_archived";
export type AuditTargetType = "transaction" | "account";

export type AuditLogRecord = {
  id: string;
  userId: string;
  actorId: string;
  actionType: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  diff: unknown;
  timestamp: Date;
};

export type AuditLogClient = {
  auditLog: {
    create(args: { data: AuditLogInput }): Promise<AuditLogRecord>;
  };
};

export type AuditLogInput = {
  userId: string;
  actorId: string;
  actionType: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  diff: Prisma.InputJsonValue;
};

export function mapAuditLog(log: AuditLogRecord) {
  return {
    id: log.id,
    userId: log.userId,
    actorId: log.actorId,
    actionType: log.actionType,
    targetType: log.targetType,
    targetId: log.targetId,
    diff: log.diff,
    timestamp: log.timestamp.toISOString(),
  };
}

export async function recordAuditLog(input: AuditLogInput, client: AuditLogClient = prisma as unknown as AuditLogClient) {
  const log = await client.auditLog.create({ data: input });
  return mapAuditLog(log);
}

type JsonPrimitive = string | number | boolean | null;

function toJsonPrimitive(value: unknown): JsonPrimitive {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

export function getChangedFields(before: Record<string, unknown>, after: Record<string, unknown>): Prisma.InputJsonObject {
  const diff: Record<string, { before: JsonPrimitive; after: JsonPrimitive }> = {};
  for (const key of Object.keys(after)) {
    const beforeValue = before[key];
    const afterValue = after[key];
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) diff[key] = { before: toJsonPrimitive(beforeValue), after: toJsonPrimitive(afterValue) };
  }
  return diff as Prisma.InputJsonObject;
}
