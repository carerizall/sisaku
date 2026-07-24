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
    const limitAmount = Number(body.limitAmount ?? 0);
    if (!body.categoryId) return NextResponse.json({ message: "Kategori wajib dipilih." }, { status: 400 });
    if (!body.monthPeriod || !/^\d{4}-\d{2}$/.test(body.monthPeriod)) return NextResponse.json({ message: "Periode bulan tidak valid." }, { status: 400 });
    if (!Number.isFinite(limitAmount) || limitAmount <= 0) return NextResponse.json({ message: "Limit anggaran tidak valid." }, { status: 400 });

    const category = await prisma.category.findFirst({ where: { id: body.categoryId, userId: user.id, type: "expense" } });
    if (!category) return NextResponse.json({ message: "Kategori pengeluaran tidak ditemukan." }, { status: 404 });

    await prisma.budget.upsert({
      where: { userId_categoryId_monthPeriod: { userId: user.id, categoryId: body.categoryId, monthPeriod: body.monthPeriod } },
      update: { limitAmount, status: "active" },
      create: { userId: user.id, categoryId: body.categoryId, monthPeriod: body.monthPeriod, limitAmount },
    });
    trackAnalyticsEvent("budget_created", { amount_range: getAmountRange(limitAmount), month_period: body.monthPeriod });

    return NextResponse.json(await getFinanceBootstrap(user.id), { status: 201 });
  } catch (error) {
    console.error("BUDGET_CREATE_ERROR", error);
    return NextResponse.json({ message: "Gagal menyimpan anggaran." }, { status: 500 });
  }
}