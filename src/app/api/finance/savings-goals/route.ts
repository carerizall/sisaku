import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFinanceBootstrap } from "@/lib/finance";
import { prisma } from "@/lib/prisma";
import { getAmountRange, trackAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const body = await request.json();
    const name = body.name?.trim();
    const targetAmount = Number(body.targetAmount ?? 0);
    if (!name) return NextResponse.json({ message: "Nama target wajib diisi." }, { status: 400 });
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return NextResponse.json({ message: "Nominal target tidak valid." }, { status: 400 });
    if (!body.targetDate || Number.isNaN(new Date(body.targetDate).getTime())) return NextResponse.json({ message: "Tanggal target tidak valid." }, { status: 400 });
    if (body.sourceAccountId) {
      const account = await prisma.financialAccount.findFirst({ where: { id: body.sourceAccountId, userId: user.id } });
      if (!account) return NextResponse.json({ message: "Akun sumber tidak ditemukan." }, { status: 404 });
    }

    await prisma.savingsGoal.create({
      data: { userId: user.id, name, targetAmount, targetDate: new Date(body.targetDate), sourceAccountId: body.sourceAccountId || null },
    });
    trackAnalyticsEvent("savings_goal_created", { amount_range: getAmountRange(targetAmount), has_source_account: Boolean(body.sourceAccountId) });
    return NextResponse.json(await getFinanceBootstrap(user.id), { status: 201 });
  } catch (error) {
    console.error("SAVINGS_GOAL_CREATE_ERROR", error);
    return NextResponse.json({ message: "Gagal menyimpan target tabungan." }, { status: 500 });
  }
}