import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories, getFinanceBootstrap } from "@/lib/finance";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    await ensureDefaultCategories(user.id);
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ message: "Nama kategori wajib diisi." }, { status: 400 });

    await prisma.category.create({
      data: {
        userId: user.id,
        name,
        icon: body.icon ?? "📦",
        color: body.color ?? "#6b7280",
        type: body.type ?? "expense",
        group: body.group ?? "other",
        status: body.status ?? "active",
        isDefault: false,
      },
    });

    return NextResponse.json(await getFinanceBootstrap(user.id), { status: 201 });
  } catch (error) {
    console.error("CATEGORY_CREATE_ERROR", error);
    return NextResponse.json({ message: "Gagal membuat kategori." }, { status: 500 });
  }
}