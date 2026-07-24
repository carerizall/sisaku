import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountClassForType, getFinanceBootstrap } from "@/lib/finance";
import { getChangedFields, recordAuditLog } from "@/lib/audit-log";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.financialAccount.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Akun tidak ditemukan." }, { status: 404 });

    const nextType = body.type ?? existing.type;
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.type === "string") {
      data.type = nextType;
      data.class = accountClassForType(nextType);
    }
    if (body.initialBalance !== undefined) data.initialBalance = Number(body.initialBalance);
    if (typeof body.currency === "string") data.currency = body.currency;
    if (typeof body.status === "string") data.status = body.status;

    const updated = await prisma.financialAccount.update({ where: { id }, data });
    if (existing.status !== "archived" && updated.status === "archived") {
      await recordAuditLog({
        userId: user.id,
        actorId: user.id,
        actionType: "account_archived",
        targetType: "account",
        targetId: id,
        diff: getChangedFields(
          { name: existing.name, type: existing.type, class: existing.class, status: existing.status },
          { name: updated.name, type: updated.type, class: updated.class, status: updated.status }
        ),
      });
    }
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("ACCOUNT_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Gagal memperbarui akun." }, { status: 500 });
  }
}