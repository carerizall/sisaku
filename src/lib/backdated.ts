import type { SafeSpendingSnapshotInputs, SnapshotClient } from "./safe-spending-snapshots.ts";
import { saveSafeSpendingSnapshot } from "./safe-spending-snapshots.ts";

export type BackdatedClient = SnapshotClient;

export type BackdatedTransactionImpact = {
  isBackdated: boolean;
  affectedPeriod: string;
  currentPeriod: string;
  hadReportedSnapshot: boolean;
  message?: string;
};

export function getMonthPeriod(date: Date | string) {
  return (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 7);
}

export async function assessBackdatedTransactionImpact(
  userId: string,
  transactionDate: Date,
  options: { now?: Date; client: BackdatedClient }
): Promise<BackdatedTransactionImpact> {
  const now = options.now ?? new Date();
  const affectedPeriod = getMonthPeriod(transactionDate);
  const currentPeriod = getMonthPeriod(now);
  const isBackdated = affectedPeriod < currentPeriod;
  const hadReportedSnapshot = isBackdated
    ? (await options.client.safeSpendingSnapshot.findFirst({ where: { userId, periodMonth: affectedPeriod } as never, orderBy: { capturedAt: "desc" } })) !== null
    : false;

  return {
    isBackdated,
    affectedPeriod,
    currentPeriod,
    hadReportedSnapshot,
    message: isBackdated
      ? hadReportedSnapshot
        ? `Transaksi backdated mengubah periode ${affectedPeriod} yang sudah memiliki snapshot/laporan. Snapshot koreksi dibuat dan laporan bulanan akan dihitung ulang dari transaksi terbaru.`
        : `Transaksi backdated mengubah periode ${affectedPeriod}. Laporan bulanan akan dihitung ulang dari transaksi terbaru.`
      : undefined,
  };
}

export async function refreshBackdatedSafeSpendingSnapshot(
  userId: string,
  transactionDate: Date,
  inputs: SafeSpendingSnapshotInputs,
  options: { now?: Date; client: BackdatedClient }
) {
  const impact = await assessBackdatedTransactionImpact(userId, transactionDate, { now: options.now, client: options.client });
  if (!impact.isBackdated) return { impact, snapshot: null };

  const snapshot = await saveSafeSpendingSnapshot(userId, inputs, {
    client: options.client,
    capturedAt: transactionDate,
  });

  return { impact, snapshot };
}
