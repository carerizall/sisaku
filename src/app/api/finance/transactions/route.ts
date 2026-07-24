import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinanceBootstrap } from "@/lib/finance";
import { recordAuditLog } from "@/lib/audit-log";
import { getAmountRange, trackAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const body = await request.json();
    const amount = Number(body.amount ?? 0);
    if (!body.accountId) return NextResponse.json({ message: "Akun wajib dipilih." }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: "Nominal transaksi tidak valid." }, { status: 400 });

    const account = await prisma.financialAccount.findFirst({ where: { id: body.accountId, userId: user.id } });
    if (!account) return NextResponse.json({ message: "Akun tidak ditemukan." }, { status: 404 });

    const type = body.type ?? "expense";
    if (type === "transfer" && !body.counterpartyAccountId) {
      return NextResponse.json({ message: "Akun tujuan wajib dipilih untuk transfer atau pembayaran kartu kredit." }, { status: 400 });
    }
    if (body.counterpartyAccountId === body.accountId) {
      return NextResponse.json({ message: "Akun sumber dan tujuan tidak boleh sama." }, { status: 400 });
    }

    if (body.counterpartyAccountId) {
      const counterparty = await prisma.financialAccount.findFirst({ where: { id: body.counterpartyAccountId, userId: user.id } });
      if (!counterparty) return NextResponse.json({ message: "Akun tujuan tidak ditemukan." }, { status: 404 });
    }

    if (body.categoryId) {
      const category = await prisma.category.findFirst({ where: { id: body.categoryId, userId: user.id } });
      if (!category) return NextResponse.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
    }

    if (body.savingsGoalId) {
      const savingsGoal = await prisma.savingsGoal.findFirst({ where: { id: body.savingsGoalId, userId: user.id } });
      if (!savingsGoal) return NextResponse.json({ message: "Target tabungan tidak ditemukan." }, { status: 404 });
    }

    const date = body.date ? new Date(body.date) : new Date();
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: body.accountId,
        type,
        amount,
        currency: body.currency ?? "IDR",
        categoryId: body.categoryId || null,
        counterpartyAccountId: body.counterpartyAccountId || null,
        savingsGoalId: body.savingsGoalId || null,
        date,
        notes: body.notes || null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      actorId: user.id,
      actionType: type === "adjustment" ? "adjustment_recorded" : "transaction_created",
      targetType: "transaction",
      targetId: transaction.id,
      diff: { after: { id: transaction.id, accountId: transaction.accountId, type: transaction.type, amount, date: date.toISOString() } },
    });
    trackAnalyticsEvent("transaction_added", { type, amount_range: getAmountRange(amount), has_category: Boolean(body.categoryId) });

    return NextResponse.json(await getFinanceBootstrap(user.id, { backdatedTransactionDate: date }), { status: 201 });
  } catch (error) {
    console.error("TRANSACTION_CREATE_ERROR", error);
    return NextResponse.json({ message: "Gagal menyimpan transaksi." }, { status: 500 });
  }
}