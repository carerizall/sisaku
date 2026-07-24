"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore } from "@/lib/store";

function BrandLogo() {
  return (
    <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border border-emerald-100 shadow-sm p-3">
      <Image src="/logo.png" alt="Sisaku" width={80} height={80} className="w-full h-full object-cover rounded-2xl" priority />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = (await response.json()) as { message?: string; user?: Parameters<typeof setUser>[0] };

      if (!response.ok || !data.user) {
        setError(data.message ?? "Registrasi gagal. Coba lagi nanti.");
        return;
      }

      setUser(data.user);
      router.replace("/onboarding");
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
          <h1 className="text-2xl font-bold text-slate-900">Buat akun Sisaku</h1>
          <p className="text-sm text-slate-500 mt-2">Catat manual, tanpa koneksi bank atau e-wallet.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}

          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span className="text-base font-bold text-blue-600">G</span>
            Daftar dengan Google
          </a>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            atau daftar dengan email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nama panggilan"
              required
            />
          </label>

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
              minLength={8}
              required
            />
          </label>

          <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
            Sisaku tidak menghubungkan rekening bank atau e-wallet. Semua data Anda dicatat manual.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}