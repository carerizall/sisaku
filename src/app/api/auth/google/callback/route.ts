import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { getGoogleRedirectUri } from "@/lib/google-oauth";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_STATE_COOKIE = "sisaku_google_oauth_state";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
};

function redirectToLogin(request: Request, message: string) {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (!clientId || !clientSecret) {
    return redirectToLogin(request, "Konfigurasi Google Login belum lengkap.");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return redirectToLogin(request, "Sesi Google Login tidak valid. Coba lagi.");
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getGoogleRedirectUri(request),
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("GOOGLE_TOKEN_ERROR", tokenData);
      return redirectToLogin(request, "Google Login gagal. Coba lagi.");
    }

    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userInfoResponse.json()) as GoogleUserInfo;

    if (!userInfoResponse.ok || !profile.sub || !profile.email || profile.email_verified === false) {
      console.error("GOOGLE_PROFILE_ERROR", profile);
      return redirectToLogin(request, "Email Google belum terverifikasi.");
    }

    const email = profile.email.trim().toLowerCase();
    const displayName = profile.name?.trim() || email.split("@")[0] || "Pengguna Sisaku";

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.sub }, { email }],
      },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.sub },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          displayName,
          googleId: profile.sub,
          isOnboarded: false,
        },
      });
    }

    await createSession(user.id);

    const destination = new URL(user.isOnboarded ? "/" : "/onboarding", request.url);
    const response = NextResponse.redirect(destination);
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    return response;
  } catch (error) {
    console.error("GOOGLE_CALLBACK_ERROR", error);
    return redirectToLogin(request, "Google Login gagal. Coba lagi nanti.");
  }
}
