import { NextResponse } from "next/server";
import { isStrongEnoughPassword, resetPasswordWithToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };
    const token = body.token ?? "";
    const password = body.password ?? "";

    if (!token) return NextResponse.json({ message: "Token reset tidak valid." }, { status: 400 });
    if (!isStrongEnoughPassword(password)) return NextResponse.json({ message: "Password minimal 8 karakter." }, { status: 400 });

    const ok = await resetPasswordWithToken(token, password);
    if (!ok) return NextResponse.json({ message: "Token reset sudah tidak berlaku. Minta tautan baru." }, { status: 400 });

    return NextResponse.json({ message: "Password berhasil diubah. Silakan login kembali." });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json({ message: "Reset password belum berhasil. Coba lagi nanti." }, { status: 500 });
  }
}
