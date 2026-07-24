import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinanceBootstrap } from "@/lib/finance";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ message: "Kategori tidak ditemukan." }, { status: 404 });

    await prisma.category.update({
      where: { id },
      data: {
        name: typeof body.name === "string" ? body.name.trim() : existing.name,
        icon: body.icon ?? existing.icon,
        color: body.color ?? existing.color,
        group: body.group ?? existing.group,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("CATEGORY_UPDATE_ERROR", error);
    return NextResponse.json({ message: "Gagal memperbarui kategori." }, { status: 500 });
  }
}