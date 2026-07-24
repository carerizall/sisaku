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
    const existing = await prisma.recurringExpense.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Pengeluaran rutin tidak ditemukan." }, { status: 404 });

    const data: {
      name?: string;
      amount?: number;
      categoryId?: string;
      interval?: "monthly" | "weekly";
      nextDueDate?: Date;
      active?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ message: "Nama pengeluaran rutin wajib diisi." }, { status: 400 });
      data.name = name;
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: "Nominal tidak valid." }, { status: 400 });
      data.amount = amount;
    }
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findFirst({ where: { id: body.categoryId, userId: user.id, type: "expense" } });
      if (!category) return NextResponse.json({ message: "Kategori pengeluaran tidak ditemukan." }, { status: 404 });
      data.categoryId = body.categoryId;
    }
    if (body.interval !== undefined) {
      if (body.interval !== "monthly" && body.interval !== "weekly") return NextResponse.json({ message: "Interval tidak valid." }, { status: 400 });
      data.interval = body.interval;
    }
    if (body.nextDueDate !== undefined) {
      const nextDueDate = new Date(body.nextDueDate);
      if (Number.isNaN(nextDueDate.getTime())) return NextResponse.json({ message: "Tanggal jatuh tempo tidak valid." }, { status: 400 });
      data.nextDueDate = nextDueDate;
    }
    if (body.active !== undefined) data.active = Boolean(body.active);

    await prisma.recurringExpense.update({ where: { id }, data });
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("RECURRING_EXPENSE_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Gagal memperbarui pengeluaran rutin." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await context.params;
    const existing = await prisma.recurringExpense.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Pengeluaran rutin tidak ditemukan." }, { status: 404 });
    await prisma.recurringExpense.delete({ where: { id } });
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("RECURRING_EXPENSE_DELETE_ERROR", error);
    return NextResponse.json({ message: "Gagal menghapus pengeluaran rutin." }, { status: 500 });
  }
}