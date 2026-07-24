"use client";

import { useStore } from "@/lib/store";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import { useState } from "react";

export default function SavingsPage() {
  const { savingsGoals, accounts, addSavingsGoal, deleteSavingsGoal, addTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState(0);
  const [form, setForm] = useState({ name: "", targetAmount: 0, targetDate: "", sourceAccountId: "" });

  const activeGoals = savingsGoals.filter((g) => g.status === "active");
  const completedGoals = savingsGoals.filter((g) => g.status === "completed");
  const activeAccounts = accounts.filter((a) => a.status === "active");

  const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = activeGoals.reduce((s, g) => s + g.savedAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSavingsGoal({
      name: form.name,
      targetAmount: Number(form.targetAmount),
      targetDate: new Date(form.targetDate).toISOString(),
      sourceAccountId: form.sourceAccountId || undefined,
    });
    setForm({ name: "", targetAmount: 0, targetDate: "", sourceAccountId: "" });
    setShowForm(false);
  };

  const handleAddFunds = (goalId: string) => {
    if (addAmount <= 0 || !showAddForm) return;
    addTransaction({
      type: "savings",
      amount: addAmount,
      currency: "IDR",
      accountId: showAddForm,
      savingsGoalId: goalId,
      date: new Date().toISOString(),
      notes: "Setoran tabungan",
    });
    setAddAmount(0);
    setShowAddForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tabungan</h1>
          <p className="text-sm text-slate-500">Capai target finansial Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          {showForm ? "Tutup" : "+ Target Baru"}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="text-xs text-slate-500 mb-1">Total Tabungan</div>
        <div className="text-3xl font-bold text-emerald-600">{formatRupiah(totalSaved)}</div>
        <div className="text-xs text-slate-400 mt-1">dari target {formatRupiah(totalTarget)}</div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }} />
        </div>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Buat Target Tabungan</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nama Target</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="contoh: Dana Darurat" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Target Nominal</label>
            <input type="number" required value={form.targetAmount || ""} onChange={(e) => setForm({ ...form, targetAmount: Number(e.target.value) })} placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Target Tanggal</label>
            <input type="date" required value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Akun Sumber (opsional)</label>
            <select value={form.sourceAccountId} onChange={(e) => setForm({ ...form, sourceAccountId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">Pilih akun...</option>
              {activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Buat Target</button>
        </form>
      )}

      {/* Active Goals */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Target Aktif ({activeGoals.length})</h2>
        <div className="space-y-3">
          {activeGoals.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="text-3xl mb-2">🐷</div>
              <p className="text-sm text-slate-500">Belum ada target tabungan</p>
            </div>
          )}
          {activeGoals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
            const remaining = g.targetAmount - g.savedAmount;
            return (
              <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">🐷 {g.name}</span>
                  <button onClick={() => deleteSavingsGoal(g.id)} className="text-[10px] text-slate-400 hover:text-red-500">Hapus</button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-emerald-600">{formatRupiah(g.savedAmount)}</span>
                  <span className="text-xs text-slate-400">/ {formatRupiah(g.targetAmount)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Sisa {formatRupiah(remaining)} · Target {formatDateShort(g.targetDate)}</span>
                  <button onClick={() => { setShowAddForm(showAddForm === g.sourceAccountId ? null : g.sourceAccountId || activeAccounts[0]?.id || ""); }} className="text-xs font-medium text-emerald-600">+ Setor</button>
                </div>
                {showAddForm && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <input type="number" value={addAmount || ""} onChange={(e) => setAddAmount(Number(e.target.value))} placeholder="Jumlah" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <select value={showAddForm} onChange={(e) => setShowAddForm(e.target.value)} className="px-2 py-2 border border-slate-200 rounded-lg text-xs">
                      {activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <button onClick={() => handleAddFunds(g.id)} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-medium">OK</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-400 mb-3">Selesai ({completedGoals.length})</h2>
          <div className="space-y-2">
            {completedGoals.map((g) => (
              <div key={g.id} className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-700">{g.name}</div>
                  <div className="text-xs text-slate-500">{formatRupiah(g.savedAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}