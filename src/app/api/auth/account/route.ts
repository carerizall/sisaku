import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser, destroyCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    trackAnalyticsEvent("account_deleted_requested", { account_age_days: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000) });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.authSession.deleteMany({ where: { userId: user.id } });
      await tx.auditLog.deleteMany({ where: { userId: user.id } });
      await tx.safeSpendingSnapshot.deleteMany({ where: { userId: user.id } });
      await tx.transaction.deleteMany({ where: { userId: user.id } });
      await tx.recurringExpense.deleteMany({ where: { userId: user.id } });
      await tx.budget.deleteMany({ where: { userId: user.id } });
      await tx.savingsGoal.deleteMany({ where: { userId: user.id } });
      await tx.category.deleteMany({ where: { userId: user.id } });
      await tx.financialAccount.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    });

    await destroyCurrentSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE_ACCOUNT_ERROR", error);
    return NextResponse.json({ message: "Akun belum berhasil dihapus. Coba lagi nanti." }, { status: 500 });
  }
}