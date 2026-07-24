import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, isValidEmail, toAuthUser, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ message: "Email atau password belum benar." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({ user: toAuthUser(user) });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ message: "Login gagal. Coba lagi nanti." }, { status: 500 });
  }
}