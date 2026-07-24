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
    const existing = await prisma.savingsGoal.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Target tabungan tidak ditemukan." }, { status: 404 });
    const data: { name?: string; targetAmount?: number; targetDate?: Date; sourceAccountId?: string | null; status?: "active" | "completed" } = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.targetAmount !== undefined) data.targetAmount = Number(body.targetAmount);
    if (body.targetDate !== undefined) data.targetDate = new Date(body.targetDate);
    if (body.sourceAccountId !== undefined) data.sourceAccountId = body.sourceAccountId || null;
    if (body.status === "active" || body.status === "completed") data.status = body.status;
    await prisma.savingsGoal.update({ where: { id }, data });
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("SAVINGS_GOAL_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Gagal memperbarui target tabungan." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });
  try {
    const { id } = await context.params;
    const existing = await prisma.savingsGoal.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Target tabungan tidak ditemukan." }, { status: 404 });
    await prisma.savingsGoal.delete({ where: { id } });
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("SAVINGS_GOAL_DELETE_ERROR", error);
    return NextResponse.json({ message: "Gagal menghapus target tabungan." }, { status: 500 });
  }
}