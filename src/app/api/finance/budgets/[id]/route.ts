import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFinanceBootstrap } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Anggaran tidak ditemukan." }, { status: 404 });

    const data: { limitAmount?: number; monthPeriod?: string; categoryId?: string } = {};
    if (body.limitAmount !== undefined) {
      const limitAmount = Number(body.limitAmount);
      if (!Number.isFinite(limitAmount) || limitAmount <= 0) return NextResponse.json({ message: "Limit anggaran tidak valid." }, { status: 400 });
      data.limitAmount = limitAmount;
    }
    if (body.monthPeriod !== undefined) {
      if (!/^\d{4}-\d{2}$/.test(body.monthPeriod)) return NextResponse.json({ message: "Periode bulan tidak valid." }, { status: 400 });
      data.monthPeriod = body.monthPeriod;
    }
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findFirst({ where: { id: body.categoryId, userId: user.id, type: "expense" } });
      if (!category) return NextResponse.json({ message: "Kategori pengeluaran tidak ditemukan." }, { status: 404 });
      data.categoryId = body.categoryId;
    }

    await prisma.budget.update({ where: { id }, data });
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("BUDGET_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Gagal memperbarui anggaran." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await context.params;
    const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Anggaran tidak ditemukan." }, { status: 404 });
    await prisma.budget.delete({ where: { id } });
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("BUDGET_DELETE_ERROR", error);
    return NextResponse.json({ message: "Gagal menghapus anggaran." }, { status: 500 });
  }
}