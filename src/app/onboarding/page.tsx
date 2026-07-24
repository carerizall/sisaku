"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore, ACCOUNT_TYPE_CONFIG } from "@/lib/store";
import { calculateSafeSpending } from "@/lib/safe-spending";
import { formatRupiah, cn, getStatusColor, getStatusIcon, getStatusLabel } from "@/lib/utils";
import { dateInputToUtcIso, getLocalDateInputValue } from "@/lib/timezone";
import type { AccountType, FinancialAccount, RecurringExpense, SavingsGoal, Transaction } from "@/lib/types";

function BrandLogo() {
  return (
    <div className="mx-auto h-24 w-24 rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 shadow-sm">
      <Image src="/logo.png" alt="Sisaku" width={96} height={96} className="h-full w-full rounded-2xl object-cover" priority />
    </div>
  );
}

const uid = () => Math.random().toString(36).slice(2, 9);
const nextMonthDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return getLocalDateInputValue(date);
};
const endOfMonthDate = () => getLocalDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

export default function OnboardingPage() {
  const {
    user,
    categories,
    setUser,
    addAccount,
    addTransaction,
    addRecurringExpense,
    addSavingsGoal,
    completeOnboarding,
    loadFinanceData,
  } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({ name: user?.displayName || "", email: user?.email || "" });
  const [accountList, setAccountList] = useState<{ name: string; type: AccountType; balance: number }[]>([
    { name: "Rekening Utama", type: "bank", balance: 0 },
  ]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [irregularIncome, setIrregularIncome] = useState(false);
  const [routineList, setRoutineList] = useState<{ name: string; amount: number; nextDueDate: string }[]>([
    { name: "Kos / Sewa", amount: 0, nextDueDate: endOfMonthDate() },
  ]);
  const [goalEnabled, setGoalEnabled] = useState(false);
  const [goal, setGoal] = useState({ name: "Dana darurat", targetAmount: 0, targetDate: nextMonthDate() });

  const totalAssets = accountList
    .filter((account) => ACCOUNT_TYPE_CONFIG[account.type].class === "asset")
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);
  const totalLiabilities = accountList
    .filter((account) => ACCOUNT_TYPE_CONFIG[account.type].class === "liability")
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);

  const preview = useMemo(() => {
    const previewAccounts: FinancialAccount[] = accountList.map((account) => ({
      id: uid(),
      userId: user?.id || "guest",
      name: account.name || ACCOUNT_TYPE_CONFIG[account.type].label,
      type: account.type,
      class: ACCOUNT_TYPE_CONFIG[account.type].class,
      initialBalance: Math.max(0, account.balance),
      currentBalance: Math.max(0, account.balance) + (ACCOUNT_TYPE_CONFIG[account.type].class === "asset" ? monthlyIncome : 0),
      currency: "IDR",
      status: "active",
      createdAt: new Date().toISOString(),
    }));

    const previewRecurring: RecurringExpense[] = routineList
      .filter((item) => item.name.trim() && item.amount > 0)
      .map((item) => ({
        id: uid(),
        userId: user?.id || "guest",
        name: item.name,
        amount: item.amount,
        categoryId: "preview-routine",
        interval: "monthly",
        nextDueDate: dateInputToUtcIso(item.nextDueDate),
        active: true,
      }));

    const previewGoals: SavingsGoal[] = goalEnabled && goal.name.trim() && goal.targetAmount > 0
      ? [{
          id: "preview-goal",
          userId: user?.id || "guest",
          name: goal.name,
          targetAmount: goal.targetAmount,
          savedAmount: 0,
          targetDate: dateInputToUtcIso(goal.targetDate),
          status: "active",
        }]
      : [];

    return calculateSafeSpending(previewAccounts, [], previewGoals, previewRecurring);
  }, [accountList, goal, goalEnabled, monthlyIncome, routineList, user?.id]);

  const submitLocalFallback = () => {
    for (const acc of accountList.filter((account) => account.name.trim())) {
      addAccount({
        name: acc.name,
        type: acc.type,
        class: ACCOUNT_TYPE_CONFIG[acc.type].class,
        initialBalance: Math.max(0, acc.balance),
        currency: "IDR",
        status: "active",
      });
    }

    const incomeCategory = categories.find((category) => category.type === "income" && category.name === "Gaji") ?? categories.find((category) => category.type === "income");
    const expenseCategory = categories.find((category) => category.type === "expense" && category.name === "Tagihan") ?? categories.find((category) => category.type === "expense");
    const primaryAccountName = accountList.find((account) => ACCOUNT_TYPE_CONFIG[account.type].class === "asset")?.name;

    if (monthlyIncome > 0 && primaryAccountName) {
      const primaryAccountId = `${primaryAccountName}-onboarding`;
      addTransaction({
        type: "income",
        amount: monthlyIncome,
        currency: "IDR",
        accountId: primaryAccountId,
        categoryId: incomeCategory?.id,
        date: new Date().toISOString(),
        notes: irregularIncome ? "Estimasi konservatif pemasukan dari onboarding" : "Pemasukan utama dari onboarding",
      });
    }

    if (expenseCategory) {
      for (const item of routineList.filter((routine) => routine.name.trim() && routine.amount > 0)) {
        addRecurringExpense({
          name: item.name,
          amount: item.amount,
          categoryId: expenseCategory.id,
          interval: "monthly",
          nextDueDate: dateInputToUtcIso(item.nextDueDate),
        });
      }
    }

    if (goalEnabled && goal.name.trim() && goal.targetAmount > 0) {
      addSavingsGoal({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: dateInputToUtcIso(goal.targetDate),
      });
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profile.name,
          accounts: accountList.map((account) => ({ name: account.name, type: account.type, initialBalance: Math.max(0, account.balance) })),
          monthlyIncome,
          recurringExpenses: routineList,
          savingsGoal: goalEnabled ? goal : null,
        }),
      });
      const data = (await response.json()) as { 
        message?: string; 
        user?: typeof user;
        finance?: {
          accounts: FinancialAccount[];
          transactions: unknown[];
          budgets: unknown[];
          savingsGoals: SavingsGoal[];
          recurringExpenses: RecurringExpense[];
          categories: unknown[];
        };
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? "Gagal menyelesaikan onboarding.");
        return;
      }

      setUser(data.user);
      
      // Populate store dengan data dari server menggunakan loadFinanceData
      if (data.finance) {
        loadFinanceData({
          accounts: data.finance.accounts,
          transactions: data.finance.transactions as Transaction[],
          budgets: data.finance.budgets as [],
          savingsGoals: data.finance.savingsGoals,
          recurringExpenses: data.finance.recurringExpenses,
          categories: data.finance.categories as [],
        });
      }
      
      // Only complete onboarding and redirect if API call succeeded
      completeOnboarding();
      router.push("/");
    } catch {
      submitLocalFallback();
      // Fallback juga harus complete onboarding dan redirect
      completeOnboarding();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Selamat Datang di Sisaku",
      content: (
        <div className="space-y-6 text-center">
          <BrandLogo />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cek sisa amanmu dalam beberapa menit</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sisaku tidak terhubung ke bank. Masukkan data manual secukupnya agar Safe Spending pertama bisa dihitung secara transparan.
            </p>
          </div>
          <button onClick={() => setStep(1)} className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Mulai onboarding</button>
        </div>
      ),
    },
    {
      title: "Profil & Akun",
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Akun keuangan awal</h2>
            <p className="mt-1 text-sm text-slate-500">Tambahkan rekening, e-wallet, kas, atau kartu kredit. Saldo kartu kredit diisi sebagai nilai kewajiban positif.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Nama" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="email@contoh.com" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div className="space-y-3">
            {accountList.map((acc, i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Akun {i + 1}</span>
                  {accountList.length > 1 && <button onClick={() => setAccountList(accountList.filter((_, idx) => idx !== i))} className="text-xs font-semibold text-red-500">Hapus</button>}
                </div>
                <input type="text" value={acc.name} onChange={(e) => setAccountList(accountList.map((a, idx) => idx === i ? { ...a, name: e.target.value } : a))} placeholder="Nama akun" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(ACCOUNT_TYPE_CONFIG) as AccountType[]).map((type) => (
                    <button key={type} type="button" onClick={() => setAccountList(accountList.map((a, idx) => idx === i ? { ...a, type } : a))} className={cn("rounded-xl border p-2 text-center transition", acc.type === type ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50")}>
                      <span className="block text-base">{ACCOUNT_TYPE_CONFIG[type].icon}</span>
                      <span className="text-[9px] text-slate-600">{ACCOUNT_TYPE_CONFIG[type].label}</span>
                    </button>
                  ))}
                </div>
                <input type="number" min="0" value={acc.balance || ""} onChange={(e) => setAccountList(accountList.map((a, idx) => idx === i ? { ...a, balance: Number(e.target.value) } : a))} placeholder={acc.type === "credit_card" ? "Tagihan aktif" : "Saldo awal"} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
            ))}
            <button onClick={() => setAccountList([...accountList, { name: "", type: "bank", balance: 0 }])} className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-emerald-400 hover:text-emerald-600">+ Tambah akun</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3"><div className="text-xs text-slate-500">Total aset</div><div className="font-bold text-emerald-700">{formatRupiah(totalAssets)}</div></div>
            <div className="rounded-2xl bg-amber-50 p-3"><div className="text-xs text-slate-500">Kewajiban</div><div className="font-bold text-amber-700">{formatRupiah(totalLiabilities)}</div></div>
          </div>
          <button onClick={() => setStep(2)} disabled={!profile.name || accountList.every((account) => !account.name.trim())} className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Lanjut</button>
        </div>
      ),
    },
    {
      title: "Pemasukan Utama",
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Masukkan pemasukan utama</h2>
            <p className="mt-1 text-sm text-slate-500">Jika penghasilan tidak tetap, isi estimasi konservatif atau rata-rata bulanan.</p>
          </div>
          <input type="number" min="0" value={monthlyIncome || ""} onChange={(e) => setMonthlyIncome(Number(e.target.value))} placeholder="Estimasi pemasukan bulanan" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <input type="checkbox" checked={irregularIncome} onChange={(e) => setIrregularIncome(e.target.checked)} className="mt-1" />
            <span>Penghasilan saya tidak tetap. Gunakan angka di atas sebagai estimasi aman, bukan prediksi optimistis.</span>
          </label>
          <button onClick={() => setStep(3)} className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Lanjut</button>
        </div>
      ),
    },
    {
      title: "Pengeluaran Rutin",
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pengeluaran rutin</h2>
            <p className="mt-1 text-sm text-slate-500">Contoh: kos, listrik, internet, cicilan, transportasi, atau langganan.</p>
          </div>
          <div className="space-y-3">
            {routineList.map((item, i) => (
              <div key={i} className="grid gap-2 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1fr_120px_120px_auto]">
                <input value={item.name} onChange={(e) => setRoutineList(routineList.map((routine, idx) => idx === i ? { ...routine, name: e.target.value } : routine))} placeholder="Nama" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input type="number" min="0" value={item.amount || ""} onChange={(e) => setRoutineList(routineList.map((routine, idx) => idx === i ? { ...routine, amount: Number(e.target.value) } : routine))} placeholder="Nominal" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <input type="date" value={item.nextDueDate} onChange={(e) => setRoutineList(routineList.map((routine, idx) => idx === i ? { ...routine, nextDueDate: e.target.value } : routine))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                {routineList.length > 1 && <button onClick={() => setRoutineList(routineList.filter((_, idx) => idx !== i))} className="text-xs font-semibold text-red-500">Hapus</button>}
              </div>
            ))}
            <button onClick={() => setRoutineList([...routineList, { name: "", amount: 0, nextDueDate: endOfMonthDate() }])} className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-emerald-400 hover:text-emerald-600">+ Tambah pengeluaran rutin</button>
          </div>
          <button onClick={() => setStep(4)} className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Lanjut</button>
        </div>
      ),
    },
    {
      title: "Target Tabungan",
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Target tabungan opsional</h2>
            <p className="mt-1 text-sm text-slate-500">Buat satu target awal atau lewati. Safe Spending tetap bisa dihitung.</p>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            Tambahkan target awal
            <input type="checkbox" checked={goalEnabled} onChange={(e) => setGoalEnabled(e.target.checked)} />
          </label>
          {goalEnabled && (
            <div className="space-y-3">
              <input value={goal.name} onChange={(e) => setGoal({ ...goal, name: e.target.value })} placeholder="Nama target" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input type="number" min="0" value={goal.targetAmount || ""} onChange={(e) => setGoal({ ...goal, targetAmount: Number(e.target.value) })} placeholder="Nominal target" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input type="date" value={goal.targetDate} onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            </div>
          )}
          <button onClick={() => setStep(5)} className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Lihat Safe Spending pertama</button>
        </div>
      ),
    },
    {
      title: "Preview Safe Spending",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl">{getStatusIcon(preview.status)}</div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">Safe Spending pertamamu</h2>
            <p className="mt-1 text-sm text-slate-500">Ini estimasi awal berdasarkan data onboarding. Kamu bisa mengubahnya kapan saja.</p>
          </div>
          <div className={cn("rounded-3xl border-2 p-5", getStatusColor(preview.status))}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Aman dibelanjakan sampai akhir periode</div>
            <div className="mt-2 text-3xl font-bold">{formatRupiah(preview.safeSpending)}</div>
            <div className="mt-1 text-sm font-semibold">Status: {getStatusLabel(preview.status)}</div>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            {preview.components.map((component) => (
              <div key={component.label} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">{component.label}</span>
                <span className="font-semibold text-slate-900">{formatRupiah(component.amount)}</span>
              </div>
            ))}
          </div>
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button disabled={loading} onClick={handleFinish} className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? "Menyimpan..." : "Selesai & masuk dashboard"}</button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{steps[step].title}</div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all", i <= step ? "bg-emerald-500" : "bg-slate-200")} />
            ))}
          </div>
          {steps[step].content}
        </div>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="mt-4 w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600">Kembali</button>
        )}
      </div>
    </div>
  );
}
