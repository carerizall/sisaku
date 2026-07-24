import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, isStrongEnoughPassword, isValidEmail, toAuthUser } from "@/lib/auth";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; displayName?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const displayName = body.displayName?.trim() || email.split("@")[0] || "Pengguna Sisaku";

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Format email belum valid." }, { status: 400 });
    }

    if (!isStrongEnoughPassword(password)) {
      return NextResponse.json({ message: "Password minimal 8 karakter." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar. Silakan login." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email, displayName, passwordHash: hashPassword(password) },
    });

    await createSession(user.id);
    trackAnalyticsEvent("user_registered", { signup_method: "email" });

    return NextResponse.json({ user: toAuthUser(user) }, { status: 201 });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json({ message: "Registrasi gagal. Coba lagi nanti." }, { status: 500 });
  }
}