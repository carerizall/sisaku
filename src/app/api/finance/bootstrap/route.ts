import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFinanceBootstrap } from "@/lib/finance";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    return NextResponse.json(await getFinanceBootstrap(user.id));
  } catch (error) {
    console.error("FINANCE_BOOTSTRAP_ERROR", error);
    return NextResponse.json({ message: "Gagal memuat data finansial." }, { status: 500 });
  }
}