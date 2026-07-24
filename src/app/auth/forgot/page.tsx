"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

function BrandLogo() {
  return (
    <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border border-emerald-100 shadow-sm p-3">
      <Image src="/logo.png" alt="Sisaku" width={80} height={80} className="w-full h-full object-cover rounded-2xl" priority />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string; resetUrl?: string };

      if (!response.ok) {
        setError(data.message ?? "Permintaan reset password gagal.");
        return;
      }

      setMessage(`${data.message ?? "Instruksi reset password akan dikirim jika email terdaftar."}${data.resetUrl ? ` Link QA: ${data.resetUrl}` : ""}`);
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
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="text-sm text-slate-500 mt-2">Masukkan email yang Anda pakai untuk Sisaku.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{message}</div>}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim instruksi"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Ingat password?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}