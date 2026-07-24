import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinanceBootstrap } from "@/lib/finance";
import { getChangedFields, recordAuditLog } from "@/lib/audit-log";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id, deletedAt: null } });
    if (!existing) return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });

    const deletedAt = new Date();
    await prisma.transaction.update({ where: { id }, data: { deletedAt } });
    await recordAuditLog({
      userId: user.id,
      actorId: user.id,
      actionType: "transaction_deleted",
      targetType: "transaction",
      targetId: id,
      diff: { before: { id, type: existing.type, amount: existing.amount.toString(), date: existing.date.toISOString() }, after: { deletedAt: deletedAt.toISOString() } },
    });
    return NextResponse.json(await getFinanceBootstrap(user.id, { backdatedTransactionDate: existing.date }));
  } catch (error) {
    console.error("TRANSACTION_DELETE_ERROR", error);
    return NextResponse.json({ message: "Gagal menghapus transaksi." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id, deletedAt: null } });
    if (!existing) return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });

    const type = body.type ?? existing.type;
    const accountId = body.accountId ?? existing.accountId;
    const counterpartyAccountId = body.counterpartyAccountId ?? existing.counterpartyAccountId;
    if (type === "transfer" && !counterpartyAccountId) {
      return NextResponse.json({ message: "Akun tujuan wajib dipilih untuk transfer atau pembayaran kartu kredit." }, { status: 400 });
    }
    if (counterpartyAccountId && counterpartyAccountId === accountId) {
      return NextResponse.json({ message: "Akun sumber dan tujuan tidak boleh sama." }, { status: 400 });
    }

    const date = body.date ? new Date(body.date) : existing.date;
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        accountId,
        type,
        amount: body.amount === undefined ? existing.amount : Number(body.amount),
        currency: body.currency ?? existing.currency,
        categoryId: body.categoryId ?? existing.categoryId,
        counterpartyAccountId,
        savingsGoalId: body.savingsGoalId ?? existing.savingsGoalId,
        date,
        notes: body.notes ?? existing.notes,
        editedAt: new Date(),
      },
    });

    await recordAuditLog({
      userId: user.id,
      actorId: user.id,
      actionType: updated.type === "adjustment" ? "adjustment_recorded" : "transaction_updated",
      targetType: "transaction",
      targetId: id,
      diff: getChangedFields(
        {
          accountId: existing.accountId,
          type: existing.type,
          amount: existing.amount.toString(),
          categoryId: existing.categoryId,
          counterpartyAccountId: existing.counterpartyAccountId,
          savingsGoalId: existing.savingsGoalId,
          date: existing.date.toISOString(),
          notes: existing.notes,
        },
        {
          accountId: updated.accountId,
          type: updated.type,
          amount: updated.amount.toString(),
          categoryId: updated.categoryId,
          counterpartyAccountId: updated.counterpartyAccountId,
          savingsGoalId: updated.savingsGoalId,
          date: updated.date.toISOString(),
          notes: updated.notes,
        }
      ),
    });

    const earliestAffectedDate = date < existing.date ? date : existing.date;
    return NextResponse.json(await getFinanceBootstrap(user.id, { backdatedTransactionDate: earliestAffectedDate }));
  } catch (error) {
    console.error("TRANSACTION_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Gagal memperbarui transaksi." }, { status: 500 });
  }
}