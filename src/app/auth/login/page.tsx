"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useStore } from "@/lib/store";

function BrandLogo() {
  return (
    <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border border-emerald-100 shadow-sm p-3">
      <Image src="/logo.png" alt="Sisaku" width={80} height={80} className="w-full h-full object-cover rounded-2xl" priority />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const oauthError = searchParams.get("error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { message?: string; user?: Parameters<typeof setUser>[0] };

      if (!response.ok || !data.user) {
        setError(data.message ?? "Login gagal. Periksa email dan password Anda.");
        return;
      }

      setUser(data.user);
      router.replace(data.user.isOnboarded ? "/" : "/onboarding");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo />
          <h1 className="text-2xl font-bold text-slate-900">Masuk ke Sisaku</h1>
          <p className="text-sm text-slate-500 mt-2">Lanjutkan catatan keuangan manual Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {(error || oauthError) && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error || oauthError}
            </div>
          )}

          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span className="text-base font-bold text-blue-600">G</span>
            Lanjut dengan Google
          </a>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            atau masuk dengan email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="nama@email.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Minimal 8 karakter"
              required
            />
          </label>

          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot" className="text-emerald-600 font-medium hover:text-emerald-700">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Daftar gratis
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}