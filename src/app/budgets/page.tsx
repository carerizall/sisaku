"use client";

import { useStore } from "@/lib/store";
import { formatRupiah, cn, getMonthLabel } from "@/lib/utils";
import { getLocalMonthPeriod } from "@/lib/timezone";
import { useState, useMemo } from "react";

export default function BudgetsPage() {
  const { budgets, categories, addBudget, deleteBudget } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ categoryId: "", limitAmount: 0 });

  const currentMonth = getLocalMonthPeriod();
  const expenseCategories = categories.filter((c) => c.type === "expense" && c.status === "active");

  const monthBudgets = useMemo(() => {
    return budgets.filter((b) => b.monthPeriod === currentMonth);
  }, [budgets, currentMonth]);

  const totalLimit = monthBudgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + b.spentAmount, 0);
  const warningBudgets = monthBudgets.filter((b) => b.limitAmount > 0 && b.spentAmount / b.limitAmount >= 0.8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = monthBudgets.find((b) => b.categoryId === form.categoryId);
    if (existing) {
      deleteBudget(existing.id);
    }
    addBudget({
      categoryId: form.categoryId,
      monthPeriod: currentMonth,
      limitAmount: Number(form.limitAmount),
    });
    setForm({ categoryId: "", limitAmount: 0 });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Anggaran</h1>
          <p className="text-sm text-slate-500">Bulan {getMonthLabel(currentMonth)}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          {showForm ? "Tutup" : "+ Tambah"}
        </button>
      </div>

      {warningBudgets.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="font-semibold">⚠️ Peringatan anggaran</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warningBudgets.map((budget) => {
              const category = categories.find((c) => c.id === budget.categoryId);
              const pct = Math.round((budget.spentAmount / budget.limitAmount) * 100);
              return <li key={budget.id}>{category?.icon} {category?.name || "Kategori"} sudah terpakai {pct}%.</li>;
            })}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Total Anggaran vs Pengeluaran</span>
          <span className={cn("text-xs font-semibold", totalSpent > totalLimit ? "text-red-500" : "text-emerald-600")}>
            {formatRupiah(totalSpent)} / {formatRupiah(totalLimit)}
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", totalSpent > totalLimit ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Tambah Anggaran</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">Pilih kategori...</option>
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Batas Anggaran</label>
            <input type="number" required value={form.limitAmount || ""} onChange={(e) => setForm({ ...form, limitAmount: Number(e.target.value) })} placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Simpan</button>
        </form>
      )}

      {/* Budget List */}
      <div className="space-y-2">
        {monthBudgets.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-slate-500">Belum ada anggaran bulan ini</p>
          </div>
        )}
        {monthBudgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const pct = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0;
          const remaining = b.limitAmount - b.spentAmount;
          return (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">{cat?.icon} {cat?.name}</span>
                <button onClick={() => deleteBudget(b.id)} className="text-[10px] text-slate-400 hover:text-red-500">Hapus</button>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-sm font-bold", b.spentAmount > b.limitAmount ? "text-red-500" : "text-slate-900")}>
                  {formatRupiah(b.spentAmount)}
                </span>
                <span className="text-xs text-slate-400">/ {formatRupiah(b.limitAmount)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={cn("h-full rounded-full transition-all", pct > 100 ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="text-xs text-slate-500">
                {remaining > 0 ? `Sisa ${formatRupiah(remaining)}` : `Lebih ${formatRupiah(Math.abs(remaining))}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}