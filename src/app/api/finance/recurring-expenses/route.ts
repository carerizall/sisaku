import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFinanceBootstrap } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });
  try {
    const body = await request.json();
    const name = body.name?.trim();
    const amount = Number(body.amount ?? 0);
    if (!name) return NextResponse.json({ message: "Nama pengeluaran rutin wajib diisi." }, { status: 400 });
    if (!body.categoryId) return NextResponse.json({ message: "Kategori wajib dipilih." }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: "Nominal tidak valid." }, { status: 400 });
    if (body.interval !== "monthly" && body.interval !== "weekly") return NextResponse.json({ message: "Interval tidak valid." }, { status: 400 });
    if (!body.nextDueDate || Number.isNaN(new Date(body.nextDueDate).getTime())) return NextResponse.json({ message: "Tanggal jatuh tempo tidak valid." }, { status: 400 });
    const category = await prisma.category.findFirst({ where: { id: body.categoryId, userId: user.id, type: "expense" } });
    if (!category) return NextResponse.json({ message: "Kategori pengeluaran tidak ditemukan." }, { status: 404 });
    await prisma.recurringExpense.create({ data: { userId: user.id, name, amount, categoryId: body.categoryId, interval: body.interval, nextDueDate: new Date(body.nextDueDate), active: true } });
    return NextResponse.json(await getFinanceBootstrap(user.id), { status: 201 });
  } catch (error) {
    console.error("RECURRING_EXPENSE_CREATE_ERROR", error);
    return NextResponse.json({ message: "Gagal menyimpan pengeluaran rutin." }, { status: 500 });
  }
}