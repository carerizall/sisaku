"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { user, setUser, resetAllData } = useStore();
  const router = useRouter();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReset = () => {
    resetAllData();
    router.push("/onboarding");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/auth/login");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "HAPUS") return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/auth/account", { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Akun belum berhasil dihapus.");
      }
      resetAllData();
      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Akun belum berhasil dihapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500">Kelola aplikasi dan data</p>
      </div>

      {/* Profile */}
      {user && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Profil</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{user.displayName}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        <button onClick={() => router.push("/categories")} className="w-full flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">🏷️</span>
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900">Kategori</div>
              <div className="text-xs text-slate-500">Kelola kategori transaksi</div>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </button>

        <button onClick={() => router.push("/onboarding")} className="w-full flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔄</span>
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900">Onboarding</div>
              <div className="text-xs text-slate-500">Ulangi proses onboarding</div>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </button>

        <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">🚪</span>
            <div className="text-left">
              <div className="text-sm font-medium text-red-600">Keluar</div>
              <div className="text-xs text-slate-500">Logout dari akun Sisaku</div>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </button>
        <button onClick={() => router.push("/privacy")} className="w-full flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔐</span>
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900">Privasi</div>
              <div className="text-xs text-slate-500">Kebijakan data dan penghapusan akun</div>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-5">
        <h2 className="font-semibold text-red-600 mb-1">Zona Berbahaya</h2>
        <p className="text-xs text-slate-500 mb-3">Tindakan ini tidak dapat dibatalkan</p>
        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)} className="w-full border border-red-300 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
            Reset Semua Data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-700 text-center">Yakin ingin menghapus semua data?</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Ya, Hapus</button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm">Batal</button>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-red-100 pt-4">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">
              Hapus Akun dan Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Ini akan menghapus akun, sesi, transaksi, akun keuangan, kategori, anggaran, target tabungan, pengeluaran rutin,
                snapshot Safe Spending, dan audit log terkait akun ini. Ketik <strong>HAPUS</strong> untuk konfirmasi.
              </p>
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder="HAPUS"
                className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />
              {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
              <div className="flex gap-2">
                <button disabled={deleteConfirmation !== "HAPUS" || isDeleting} onClick={handleDeleteAccount} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {isDeleting ? "Menghapus..." : "Ya, Hapus Akun"}
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmation(""); setDeleteError(""); }} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm">
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="text-center">
        <div className="text-xs text-slate-400">Sisaku v1.0.0</div>
        <div className="text-[10px] text-slate-400 mt-1">Safe Spending Calculator</div>
      </div>
    </div>
  );
}