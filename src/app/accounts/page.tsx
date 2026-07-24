"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ACCOUNT_TYPE_CONFIG, useStore } from "@/lib/store";
import { cn, formatRupiah } from "@/lib/utils";
import type { AccountType, FinancialAccount } from "@/lib/types";

const DEFAULT_FORM = { name: "", type: "cash" as AccountType, initialBalance: 0, currency: "IDR" };

function SummaryCard({ label, value, icon, tone, helper }: { label: string; value: string; icon: string; tone: string; helper: string }) {
  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm", tone)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-xl font-bold text-slate-900">{value}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-xl shadow-sm ring-1 ring-white/70">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyAccounts({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300/80 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl ring-1 ring-emerald-100">
        💳
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Belum ada akun aktif</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Tambahkan rekening bank, e-wallet, uang tunai, atau kartu kredit agar saldo dan arus kas bisa dihitung otomatis.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        + Tambah akun pertama
      </button>
    </div>
  );
}

function AccountCard({ account, onEdit, onArchive }: { account: FinancialAccount; onEdit: (account: FinancialAccount) => void; onArchive?: (id: string) => void }) {
  const config = ACCOUNT_TYPE_CONFIG[account.type];
  const isLiability = account.class === "liability" || account.currentBalance < 0;

  return (
    <div className={cn("rounded-[1.5rem] border p-4 shadow-sm transition", account.status === "archived" ? "border-slate-200 bg-slate-50/80 opacity-70" : "border-slate-200/80 bg-white/85 hover:-translate-y-0.5 hover:shadow-md")}>
      <div className="flex items-center gap-4">
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1", isLiability ? "bg-rose-50 ring-rose-100" : "bg-emerald-50 ring-emerald-100")}>
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900">{account.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{config.label}</span>
            <span>•</span>
            <span>{account.class === "asset" ? "Aset" : "Utang"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-sm font-bold", isLiability ? "text-rose-500" : "text-slate-900")}>{formatRupiah(account.currentBalance)}</div>
          <div className="mt-1 text-[11px] text-slate-400">Saldo saat ini</div>
        </div>
      </div>

      {account.status !== "archived" && (
        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={() => onEdit(account)} className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700">
            Edit
          </button>
          {onArchive && (
            <button type="button" onClick={() => onArchive(account.id)} className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
              Arsip
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, archiveAccount } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const visibleAccounts = useMemo(() => (mounted ? accounts : []), [mounted, accounts]);
  const activeAccounts = useMemo(() => visibleAccounts.filter((account) => account.status === "active"), [visibleAccounts]);
  const archivedAccounts = useMemo(() => visibleAccounts.filter((account) => account.status === "archived"), [visibleAccounts]);

  const totalAssets = activeAccounts.filter((account) => account.class === "asset").reduce((sum, account) => sum + account.currentBalance, 0);
  const totalLiabilities = activeAccounts.filter((account) => account.class === "liability").reduce((sum, account) => sum + account.currentBalance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const selectedConfig = ACCOUNT_TYPE_CONFIG[form.type];

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accountClass = ACCOUNT_TYPE_CONFIG[form.type].class;

    if (editingId) {
      updateAccount(editingId, { name: form.name, type: form.type, initialBalance: form.initialBalance, class: accountClass });
    } else {
      addAccount({
        name: form.name,
        type: form.type,
        class: accountClass,
        initialBalance: form.initialBalance,
        currency: form.currency,
        status: "active",
      });
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (account: FinancialAccount) => {
    setForm({ name: account.name, type: account.type, initialBalance: account.initialBalance, currency: account.currency });
    setEditingId(account.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              💼 Pusat saldo pribadi
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Akun</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Kelola rekening, dompet digital, uang tunai, dan utang dalam satu tampilan yang mudah dipantau.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {showForm ? "Tutup form" : "+ Tambah akun"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Kekayaan Bersih" value={formatRupiah(netWorth)} icon="📊" helper="Aset dikurangi total utang aktif." tone={netWorth < 0 ? "border-rose-100 bg-gradient-to-br from-white to-rose-50/80" : "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80"} />
        <SummaryCard label="Total Aset" value={formatRupiah(totalAssets)} icon="🏦" helper={`${activeAccounts.filter((account) => account.class === "asset").length} akun aset aktif.`} tone="border-cyan-100 bg-gradient-to-br from-white to-cyan-50/80" />
        <SummaryCard label="Total Utang" value={formatRupiah(totalLiabilities)} icon="💳" helper={`${activeAccounts.filter((account) => account.class === "liability").length} akun utang aktif.`} tone="border-amber-100 bg-gradient-to-br from-white to-amber-50/80" />
      </section>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Akun" : "Tambah Akun Baru"}</h2>
              <p className="mt-1 text-sm text-slate-500">Pilih jenis akun, isi nama, lalu masukkan saldo awal.</p>
            </div>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">
              Tutup
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Akun</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Rekening BCA, GoPay, Cash"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo Awal</label>
              <input
                type="number"
                required
                value={form.initialBalance || ""}
                onChange={(e) => setForm({ ...form, initialBalance: Number(e.target.value) })}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <p className="mt-1.5 text-xs text-slate-400">Untuk kartu kredit/utang, masukkan nominal tagihan sebagai saldo awal.</p>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipe Akun</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {(Object.keys(ACCOUNT_TYPE_CONFIG) as AccountType[]).map((type) => {
                const config = ACCOUNT_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={cn(
                      "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition",
                      form.type === type ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-xs font-semibold">{config.label}</span>
                    <span className="text-[10px] text-slate-400">{config.class === "asset" ? "Aset" : "Utang"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">{selectedConfig.icon}</div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{selectedConfig.label}</div>
                <p className="text-xs text-slate-500">Akun ini akan dihitung sebagai {selectedConfig.class === "asset" ? "aset" : "utang"} dalam ringkasan kekayaan bersih.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              {editingId ? "Simpan perubahan" : "Tambah akun"}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Akun Aktif</h2>
            <p className="text-sm text-slate-500">{activeAccounts.length} akun aktif siap dipakai untuk transaksi.</p>
          </div>
        </div>

        {activeAccounts.length === 0 ? (
          <EmptyAccounts onCreate={openCreateForm} />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {activeAccounts.map((account) => (
              <AccountCard key={account.id} account={account} onEdit={handleEdit} onArchive={archiveAccount} />
            ))}
          </div>
        )}
      </section>

      {archivedAccounts.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-500">Diarsipkan</h2>
            <p className="text-sm text-slate-400">{archivedAccounts.length} akun disimpan sebagai histori dan tidak dipakai untuk transaksi baru.</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {archivedAccounts.map((account) => (
              <AccountCard key={account.id} account={account} onEdit={handleEdit} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}