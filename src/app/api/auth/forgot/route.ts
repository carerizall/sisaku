import { NextResponse } from "next/server";
import { createPasswordResetToken, isValidEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Format email belum valid." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    let resetUrl: string | undefined;
    if (user?.passwordHash) {
      const { token } = await createPasswordResetToken(user.id);
      const origin = request.headers.get("origin") || new URL(request.url).origin;
      resetUrl = `${origin}/auth/reset?token=${encodeURIComponent(token)}`;
      // TODO: wire SMTP/provider here. The token is stored hashed and this URL is only exposed outside production for local QA.
      console.info("PASSWORD_RESET_REQUESTED", { userId: user.id, resetUrl: process.env.NODE_ENV === "production" ? "[redacted]" : resetUrl });
    }

    return NextResponse.json({
      message: "Jika email terdaftar, instruksi reset password akan dikirim.",
      resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json({ message: "Permintaan reset password belum berhasil. Coba lagi nanti." }, { status: 500 });
  }
}