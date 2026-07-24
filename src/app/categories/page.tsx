"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { CategoryType, CategoryGroup } from "@/lib/types";

const ICON_OPTIONS = ["🍜", "🚗", "🛍️", "🎮", "🧾", "🏥", "📚", "👨‍👩‍👧", "📱", "💼", "💻", "🎁", "🎉", "✈️", "🏠", "💸", "💳", "🎵", "☕", "🍔", "👕", "💊", "🐾", "📦", "📝", " other"];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; icon: string; color: string; type: CategoryType; group: CategoryGroup }>({ name: "", icon: "📦", color: "#6b7280", type: "expense", group: "other" });

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategory(editingId, { name: form.name, icon: form.icon, color: form.color, group: form.group });
    } else {
      addCategory({ name: form.name, icon: form.icon, color: form.color, type: form.type, group: form.group, status: "active" });
    }
    setForm({ name: "", icon: "📦", color: "#6b7280", type: "expense", group: "other" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type, group: cat.group });
      setEditingId(catId);
      setShowForm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kategori</h1>
          <p className="text-sm text-slate-500">Kelola kategori transaksi</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", icon: "📦", color: "#6b7280", type: "expense", group: "other" }); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          {showForm ? "Tutup" : "+ Tambah"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</h2>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nama</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama kategori" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>

          {!editingId && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipe</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm({ ...form, type: "expense" })} className={cn("py-2 rounded-lg border text-sm", form.type === "expense" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600")}>Pengeluaran</button>
                <button type="button" onClick={() => setForm({ ...form, type: "income" })} className={cn("py-2 rounded-lg border text-sm", form.type === "income" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600")}>Pemasukan</button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ikon</label>
            <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
              {ICON_OPTIONS.map((icon) => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={cn("p-2 rounded-lg border text-lg", form.icon === icon ? "border-emerald-500 bg-emerald-50" : "border-slate-200")}>{icon}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Warna</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-8 rounded cursor-pointer" />
              <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">{editingId ? "Simpan" : "Tambah"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Batal</button>
          </div>
        </form>
      )}

      {/* Expense Categories */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Pengeluaran ({expenseCats.length})</h2>
        <div className="grid grid-cols-2 gap-2">
          {expenseCats.map((c) => (
            <div key={c.id} className={cn("bg-white rounded-xl border p-3 flex items-center gap-2", c.status === "disabled" && "opacity-40")}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${c.color}20` }}>{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{c.name}</div>
                {c.isDefault && <div className="text-[10px] text-slate-400">Bawaan</div>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleEdit(c.id)} className="text-[10px] text-slate-400 hover:text-emerald-600">Edit</button>
                <button onClick={() => deleteCategory(c.id)} className="text-[10px] text-slate-400 hover:text-red-500">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income Categories */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Pemasukan ({incomeCats.length})</h2>
        <div className="grid grid-cols-2 gap-2">
          {incomeCats.map((c) => (
            <div key={c.id} className={cn("bg-white rounded-xl border p-3 flex items-center gap-2", c.status === "disabled" && "opacity-40")}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${c.color}20` }}>{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{c.name}</div>
                {c.isDefault && <div className="text-[10px] text-slate-400">Bawaan</div>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleEdit(c.id)} className="text-[10px] text-slate-400 hover:text-emerald-600">Edit</button>
                <button onClick={() => deleteCategory(c.id)} className="text-[10px] text-slate-400 hover:text-red-500">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}