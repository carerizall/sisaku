"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { cn, formatDateShort, formatRupiah } from "@/lib/utils";
import { dateInputToUtcIso, getLocalDateInputValue, getLocalMonthPeriod, isoToDateInput } from "@/lib/timezone";
import type { TransactionType } from "@/lib/types";

type TransactionMode = TransactionType | "credit_card_payment";

const TX_TYPES: { value: TransactionType; label: string; icon: string; tone: string }[] = [
  { value: "expense", label: "Pengeluaran", icon: "💸", tone: "border-rose-100 bg-rose-50 text-rose-600" },
  { value: "income", label: "Pemasukan", icon: "💵", tone: "border-emerald-100 bg-emerald-50 text-emerald-600" },
  { value: "transfer", label: "Transfer", icon: "🔄", tone: "border-cyan-100 bg-cyan-50 text-cyan-600" },
  { value: "savings", label: "Tabung", icon: "🐷", tone: "border-amber-100 bg-amber-50 text-amber-600" },
];

function SummaryCard({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm", tone)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-xl font-bold text-slate-900">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-xl shadow-sm ring-1 ring-white/70">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyTransactions({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300/80 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl ring-1 ring-emerald-100">
        📝
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Belum ada transaksi</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Catat pemasukan, pengeluaran, transfer, atau setoran tabungan pertama agar ringkasan keuangan Anda mulai terbentuk.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        + Catat transaksi pertama
      </button>
    </div>
  );
}

export default function TransactionsPage() {
  const { transactions, accounts, categories, savingsGoals, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [form, setForm] = useState({
    mode: "expense" as TransactionMode,
    amount: 0,
    accountId: "",
    categoryId: "",
    counterpartyAccountId: "",
    savingsGoalId: "",
    date: getLocalDateInputValue(),
    notes: "",
  });

  const activeAccounts = accounts.filter((account) => account.status === "active");
  const sourceAccounts = activeAccounts.filter((account) => account.class === "asset");
  const creditCardAccounts = activeAccounts.filter((account) => account.type === "credit_card" || account.class === "liability");
  const expenseCategories = categories.filter((category) => category.type === "expense" && category.status === "active");
  const incomeCategories = categories.filter((category) => category.type === "income" && category.status === "active");
  const activeGoals = savingsGoals.filter((goal) => goal.status === "active");
  const currentMonth = getLocalMonthPeriod();

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => getLocalMonthPeriod(transaction.date) === currentMonth),
    [transactions, currentMonth]
  );
  const monthIncome = monthTransactions.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthExpense = monthTransactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthSavings = monthTransactions.filter((transaction) => transaction.type === "savings").reduce((sum, transaction) => sum + transaction.amount, 0);
  const netCashFlow = monthIncome - monthExpense - monthSavings;

  const filteredTx = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      if (filter !== "all" && transaction.type !== filter) return false;
      if (!normalizedSearch) return true;
      const category = categories.find((item) => item.id === transaction.categoryId);
      const account = accounts.find((item) => item.id === transaction.accountId);
      const counterparty = accounts.find((item) => item.id === transaction.counterpartyAccountId);
      return [transaction.notes, category?.name, account?.name, counterparty?.name, transaction.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [accounts, categories, filter, search, transactions]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filteredTx> = {};
    for (const transaction of filteredTx) {
      const day = isoToDateInput(transaction.date);
      if (!groups[day]) groups[day] = [];
      groups[day].push(transaction);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTx]);

  const transactionType = form.mode === "credit_card_payment" ? "transfer" : form.mode;
  const isCreditCardPayment = form.mode === "credit_card_payment";

  const handleModeChange = (mode: TransactionMode) => {
    setForm({ ...form, mode, categoryId: "", counterpartyAccountId: "", savingsGoalId: "" });
    setFormError("");
  };

  const resetForm = () => {
    setForm({ mode: "expense", amount: 0, accountId: "", categoryId: "", counterpartyAccountId: "", savingsGoalId: "", date: getLocalDateInputValue(), notes: "" });
    setEditingId(null);
    setFormError("");
  };

  const openEditTransaction = (transactionId: string) => {
    const transaction = transactions.find((item) => item.id === transactionId);
    if (!transaction) return;
    setEditingId(transaction.id);
    setForm({
      mode: transaction.type,
      amount: transaction.amount,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId || "",
      counterpartyAccountId: transaction.counterpartyAccountId || "",
      savingsGoalId: transaction.savingsGoalId || "",
      date: isoToDateInput(transaction.date),
      notes: transaction.notes || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const validateForm = () => {
    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) return "Jumlah transaksi harus lebih dari 0.";
    if (!form.accountId) return isCreditCardPayment ? "Pilih akun sumber pembayaran." : "Pilih akun sumber.";
    if ((transactionType === "expense" || transactionType === "income") && !form.categoryId) return "Pilih kategori transaksi terlebih dahulu.";
    if (transactionType === "transfer" && !form.counterpartyAccountId) return isCreditCardPayment ? "Pilih kartu kredit yang akan dibayar." : "Pilih akun tujuan transfer.";
    if (transactionType === "transfer" && form.counterpartyAccountId === form.accountId) return "Akun sumber dan tujuan tidak boleh sama.";
    if (transactionType === "savings" && !form.savingsGoalId) return "Pilih target tabungan terlebih dahulu.";
    if (!form.date) return "Tanggal transaksi wajib diisi.";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    const duplicate = transactions.find((transaction) => {
      if (transaction.id === editingId) return false;
      return transaction.type === transactionType && transaction.amount === Number(form.amount) && transaction.accountId === form.accountId && (transaction.categoryId || "") === form.categoryId && (transaction.counterpartyAccountId || "") === form.counterpartyAccountId && (transaction.savingsGoalId || "") === form.savingsGoalId && isoToDateInput(transaction.date) === form.date;
    });
    if (duplicate && !window.confirm("Ada transaksi dengan nominal, tanggal, akun, dan kategori/tujuan yang sama. Tetap simpan?")) return;

    const payload = {
      type: transactionType,
      amount: Number(form.amount),
      currency: "IDR",
      accountId: form.accountId,
      categoryId: transactionType === "expense" || transactionType === "income" ? form.categoryId : undefined,
      counterpartyAccountId: transactionType === "transfer" ? form.counterpartyAccountId : undefined,
      savingsGoalId: transactionType === "savings" ? form.savingsGoalId : undefined,
      date: dateInputToUtcIso(form.date),
      notes: form.notes || (isCreditCardPayment ? "Bayar kartu kredit" : ""),
    };
    if (editingId) updateTransaction(editingId, payload);
    else addTransaction(payload);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">📝 Aktivitas uang harian</div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Transaksi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Catat pemasukan, pengeluaran, transfer, dan tabungan dengan alur yang lebih jelas.</p>
          </div>
          <button type="button" onClick={() => { if (showForm) resetForm(); setShowForm(!showForm); }} className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            {showForm ? "Tutup form" : "+ Catat transaksi"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Pemasukan Bulan Ini" value={formatRupiah(monthIncome)} icon="↘️" tone="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80" />
        <SummaryCard label="Pengeluaran Bulan Ini" value={formatRupiah(monthExpense)} icon="↗️" tone="border-rose-100 bg-gradient-to-br from-white to-rose-50/80" />
        <SummaryCard label="Setoran Tabungan" value={formatRupiah(monthSavings)} icon="🐷" tone="border-amber-100 bg-gradient-to-br from-white to-amber-50/80" />
        <SummaryCard label="Arus Kas Bersih" value={formatRupiah(netCashFlow)} icon="🌊" tone="border-cyan-100 bg-gradient-to-br from-white to-cyan-50/80" />
      </section>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit transaksi" : form.mode === "expense" ? "Catat pengeluaran" : form.mode === "income" ? "Catat pemasukan" : form.mode === "transfer" ? "Catat transfer" : form.mode === "credit_card_payment" ? "Bayar kartu kredit" : "Catat tabungan"}</h2>
              <p className="mt-1 text-sm text-slate-500">Pilih jenis transaksi lalu lengkapi detailnya.</p>
            </div>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">Tutup</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TX_TYPES.map((type) => (
              <button key={type.value} type="button" onClick={() => handleModeChange(type.value)} className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left transition", form.mode === type.value ? type.tone : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm font-semibold">{type.label}</span>
              </button>
            ))}
            <button type="button" onClick={() => handleModeChange("credit_card_payment")} className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left transition", isCreditCardPayment ? "border-violet-100 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
              <span className="text-xl">💳</span>
              <span className="text-sm font-semibold">Bayar kartu kredit</span>
            </button>
          </div>

          {(form.mode === "transfer" || isCreditCardPayment) && (
            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 text-sm leading-6 text-cyan-800">
              {isCreditCardPayment ? "Pembayaran kartu kredit dicatat sebagai transfer ke akun kartu kredit, bukan pengeluaran baru. Pengeluaran sudah terjadi saat Anda memakai kartu." : "Transfer antar akun hanya memindahkan saldo, jadi tidak masuk laporan cashflow income/expense."}
            </div>
          )}

          {formError && <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-700">{formError}</div>}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah</label>
              <input type="number" required min="1" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Akun sumber</label>
              <select required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value, counterpartyAccountId: e.target.value === form.counterpartyAccountId ? "" : form.counterpartyAccountId })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="">Pilih akun...</option>
                {(isCreditCardPayment ? sourceAccounts : activeAccounts).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </div>
          </div>

          {transactionType === "transfer" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{isCreditCardPayment ? "Kartu kredit yang dibayar" : "Akun tujuan"}</label>
              <select required value={form.counterpartyAccountId} onChange={(e) => setForm({ ...form, counterpartyAccountId: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="">{isCreditCardPayment ? "Pilih kartu kredit..." : "Pilih tujuan..."}</option>
                {(isCreditCardPayment ? creditCardAccounts : activeAccounts).filter((account) => account.id !== form.accountId).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </div>
          )}

          {transactionType === "savings" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Target tabungan</label>
              <select required value={form.savingsGoalId} onChange={(e) => setForm({ ...form, savingsGoalId: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="">Pilih target...</option>
                {activeGoals.map((goal) => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
              </select>
            </div>
          )}

          {(transactionType === "expense" || transactionType === "income") && (
            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Kategori</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {(transactionType === "expense" ? expenseCategories : incomeCategories).slice(0, 12).map((category) => (
                  <button key={category.id} type="button" onClick={() => setForm({ ...form, categoryId: category.id })} className={cn("flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center transition", form.categoryId === category.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
                    <span className="text-xl">{category.icon}</span>
                    <span className="line-clamp-2 text-[10px] font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Catatan</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Contoh: makan siang, gaji, transfer dana" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Batal</button>
            <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">{editingId ? "Update transaksi" : "Simpan transaksi"}</button>
          </div>
        </form>
      )}

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Riwayat Transaksi</h2>
            <p className="text-sm text-slate-500">{filteredTx.length} transaksi ditampilkan</p>
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari catatan, kategori, akun..." className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", ...TX_TYPES.map((type) => type.value)] as const).map((filterValue) => {
              const typeConfig = TX_TYPES.find((type) => type.value === filterValue);
              return (
                <button key={filterValue} type="button" onClick={() => setFilter(filterValue)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition", filter === filterValue ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-50")}>
                  {filterValue === "all" ? "Semua" : `${typeConfig?.icon} ${typeConfig?.label}`}
                </button>
              );
            })}
          </div>
        </div>

        {groupedByDate.length === 0 ? (
          <EmptyTransactions onCreate={() => setShowForm(true)} />
        ) : (
          <div className="space-y-5">
            {groupedByDate.map(([day, dayTransactions]) => (
              <div key={day}>
                <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDateShort(day)}</div>
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-sm divide-y divide-slate-100">
                  {dayTransactions.map((transaction) => {
                    const category = categories.find((item) => item.id === transaction.categoryId);
                    const account = accounts.find((item) => item.id === transaction.accountId);
                    const counterparty = accounts.find((item) => item.id === transaction.counterpartyAccountId);
                    const goal = savingsGoals.find((item) => item.id === transaction.savingsGoalId);
                    const typeConfig = TX_TYPES.find((type) => type.value === transaction.type);
                    return (
                      <div key={transaction.id} className="flex items-center gap-4 p-4 transition hover:bg-slate-50/80">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: category?.color ? `${category.color}18` : "#f1f5f9" }}>
                          {category?.icon || typeConfig?.icon || "💸"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-900">{transaction.notes || category?.name || typeConfig?.label || "Transaksi"}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>{account?.name || "Akun"}</span>
                            <span>•</span>
                            <span>{typeConfig?.label || transaction.type}</span>
                            {(counterparty || goal || category) && <><span>•</span><span>{counterparty?.name || goal?.name || category?.name}</span></>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-sm font-bold", transaction.type === "income" ? "text-emerald-600" : transaction.type === "expense" ? "text-rose-500" : "text-slate-700")}>
                            {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}{formatRupiah(transaction.amount)}
                          </div>
                          <div className="mt-1 flex justify-end gap-2 text-[11px] font-medium">
                            <button type="button" onClick={() => openEditTransaction(transaction.id)} className="text-slate-400 transition hover:text-emerald-600">Edit</button>
                            {deleteCandidateId === transaction.id ? (
                              <><button type="button" onClick={() => { deleteTransaction(transaction.id); setDeleteCandidateId(null); }} className="text-rose-500">Ya</button><button type="button" onClick={() => setDeleteCandidateId(null)} className="text-slate-400">Batal</button></>
                            ) : (
                              <button type="button" onClick={() => setDeleteCandidateId(transaction.id)} className="text-slate-400 transition hover:text-rose-500">Hapus</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}