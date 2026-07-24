"use client";

import { useStore, ACCOUNT_TYPE_CONFIG } from "@/lib/store";
import { formatRupiah, formatDateShort, cn, getStatusColor, getStatusLabel, getStatusIcon } from "@/lib/utils";
import { daysUntilLocalDate, getLocalMonthPeriod } from "@/lib/timezone";
import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";

function BrandLogo() {
  return (
    <div className="mx-auto mb-5 h-24 w-24 rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 shadow-sm">
      <Image src="/logo.png" alt="Sisaku" width={96} height={96} className="h-full w-full rounded-2xl object-cover" priority />
    </div>
  );
}

function SectionHeader({ title, actionHref, actionLabel }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="rounded-xl px-2 py-1 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  actionHint,
}: {
  icon: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  actionHint?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-emerald-200/90 bg-gradient-to-br from-white via-white to-emerald-50/50 p-7 text-center shadow-sm backdrop-blur-sm sm:p-9">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl ring-1 ring-emerald-100">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {actionHint && <p className="mx-auto mt-3 max-w-sm text-xs font-medium leading-5 text-emerald-700">{actionHint}</p>}
      <Link
        href={actionHref}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        {actionLabel} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function MetricCard({
  label,
  value,
  caption,
  tone,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  tone: string;
  icon: string;
}) {
  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-sm", tone)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-xl shadow-sm ring-1 ring-white/70">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-600">{caption}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, accounts, transactions, categories, safeSpending, budgets, savingsGoals, recurringExpenses } = useStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentMonth = getLocalMonthPeriod();

  const monthTransactions = transactions.filter((t) => getLocalMonthPeriod(t.date) === currentMonth);
  const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);
  const activeBudgets = budgets.filter((b) => b.monthPeriod === currentMonth);
  const activeGoals = savingsGoals.filter((g) => g.status === "active").slice(0, 3);
  const totalAssets = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const totalBudgetUsed = activeBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const totalBudgetLimit = activeBudgets.reduce((sum, budget) => sum + budget.limitAmount, 0);
  const budgetUsage = totalBudgetLimit > 0 ? Math.min(100, (totalBudgetUsed / totalBudgetLimit) * 100) : 0;
  const safeSpendingValue = safeSpending?.safeSpending ?? 0;
  const safeSpendingStatus = safeSpending?.status ?? "safe";
  const dueRecurringExpenses = recurringExpenses
    .filter((expense) => expense.active)
    .map((expense) => ({ ...expense, daysUntilDue: daysUntilLocalDate(expense.nextDueDate) }))
    .filter((expense) => expense.daysUntilDue >= 0 && expense.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 3);

  if (mounted && !user?.isOnboarded) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-xl rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-10">
          <BrandLogo />
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            ✨ Siap mulai mengatur keuangan
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Selamat datang di Sisaku</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Aplikasi pengelolaan keuangan dengan fitur Safe Spending untuk membantu Anda mengatur uang dengan lebih aman, tenang, dan terarah.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/onboarding" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              Mulai Sekarang
            </Link>
            <Link href="/accounts" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              Lihat akun
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 xl:space-y-12">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="grid gap-9 p-6 lg:grid-cols-[1.45fr_0.9fr] lg:p-9 xl:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <span>👋</span>
              {mounted && user?.displayName ? `Halo, ${user.displayName}` : "Halo, kembali lagi"}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard keuangan yang lebih tenang, lega, dan mudah dibaca.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Lihat kondisi Safe Spending, arus kas bulan ini, dan progres tujuan Anda dalam satu tampilan yang lebih rapi.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/transactions" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200">
                + Catat transaksi
              </Link>
              <Link href="/accounts" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200">
                Kelola akun
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Akun aktif</div>
                <div className="mt-2 text-lg font-bold text-slate-900">{mounted ? accounts.length : "-"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transaksi bulan ini</div>
                <div className="mt-2 text-lg font-bold text-slate-900">{mounted ? monthTransactions.length : "-"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anggaran aktif</div>
                <div className="mt-2 text-lg font-bold text-slate-900">{mounted ? activeBudgets.length : "-"}</div>
              </div>
            </div>

            {dueRecurringExpenses.length > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-800">
                <div className="font-semibold">🔔 Pengeluaran rutin mendekat</div>
                <div className="mt-2 space-y-1">
                  {dueRecurringExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between gap-3">
                      <span>{expense.name} • {expense.daysUntilDue === 0 ? "hari ini" : `${expense.daysUntilDue} hari lagi`}</span>
                      <span className="font-semibold">{formatRupiah(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={cn("rounded-[1.75rem] border-2 p-5 shadow-sm", getStatusColor(safeSpendingStatus))}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Safe Spending</div>
                <div className="mt-1 text-sm opacity-70">Aman untuk dibelanjakan hari ini</div>
              </div>
              <span className="text-3xl">{getStatusIcon(safeSpendingStatus)}</span>
            </div>

            <div className="mt-4 text-3xl font-bold tracking-tight">{mounted ? formatRupiah(safeSpendingValue) : "-"}</div>
            <div className="mt-1 text-sm font-medium opacity-80">Status: {safeSpending ? getStatusLabel(safeSpending.status) : "-"}</div>

            <div className="mt-5 space-y-2 rounded-2xl bg-white/60 p-4 ring-1 ring-white/60">
              {safeSpending?.components.map((component, index) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-600">{component.label}</span>
                  <span className="whitespace-nowrap font-semibold text-slate-900">{formatRupiah(component.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Aset Aktif"
          value={mounted ? formatRupiah(totalAssets) : "-"}
          caption="Total saldo dari semua akun Anda."
          tone="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80"
          icon="💎"
        />
        <MetricCard
          label="Pemasukan Bulan Ini"
          value={mounted ? formatRupiah(monthIncome) : "-"}
          caption="Semua pemasukan yang tercatat bulan ini."
          tone="border-cyan-100 bg-gradient-to-br from-white to-cyan-50/80"
          icon="↘️"
        />
        <MetricCard
          label="Pengeluaran Bulan Ini"
          value={mounted ? formatRupiah(monthExpense) : "-"}
          caption="Pengeluaran yang sudah terjadi bulan ini."
          tone="border-rose-100 bg-gradient-to-br from-white to-rose-50/80"
          icon="↗️"
        />
        <MetricCard
          label="Pemakaian Anggaran"
          value={mounted ? `${Math.round(budgetUsage)}%` : "-"}
          caption={totalBudgetLimit > 0 ? `${formatRupiah(totalBudgetUsed)} dari ${formatRupiah(totalBudgetLimit)}` : "Belum ada anggaran aktif."}
          tone="border-amber-100 bg-gradient-to-br from-white to-amber-50/80"
          icon="🎯"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-8">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <SectionHeader title="Akun Saya" actionHref="/accounts" actionLabel="Lihat semua" />
            {mounted && accounts.length === 0 ? (
              <EmptyPanel
                icon="💳"
                title="Belum ada akun"
                description="Tambahkan rekening, dompet, atau tabungan supaya saldo dan Safe Spending bisa dihitung dengan lebih akurat."
                actionHref="/accounts"
                actionLabel="Tambah akun sekarang"
                actionHint="Mulai dari rekening utama atau e-wallet yang paling sering dipakai."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {mounted && accounts.slice(0, 4).map((account) => {
                  const config = ACCOUNT_TYPE_CONFIG[account.type];
                  return (
                    <div key={account.id} className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <span className="text-lg">{config.icon}</span>
                            <span className="truncate">{account.name}</span>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">{config.label}</div>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                          {account.status === "active" ? "Aktif" : "Arsip"}
                        </div>
                      </div>
                      <div className={cn("mt-4 text-lg font-bold", account.currentBalance < 0 ? "text-rose-500" : "text-slate-900")}>
                        {formatRupiah(account.currentBalance)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <SectionHeader title="Transaksi Terbaru" actionHref="/transactions" actionLabel="Lihat semua" />
            {mounted && recentTransactions.length === 0 ? (
              <EmptyPanel
                icon="📝"
                title="Belum ada transaksi"
                description="Mulai catat pemasukan atau pengeluaran pertama agar ringkasan keuangan Anda langsung terisi."
                actionHref="/transactions"
                actionLabel="Catat transaksi pertama"
                actionHint="Butuh kurang dari satu menit untuk mencatat transaksi pertama."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
                {mounted && recentTransactions.map((transaction) => {
                  const category = categories.find((c) => c.id === transaction.categoryId);
                  return (
                    <div key={transaction.id} className="flex items-center gap-4 p-4 transition hover:bg-slate-50/80">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: category?.color ? `${category.color}18` : "#f1f5f9" }}>
                        {category?.icon || "💸"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">{transaction.notes || category?.name || "Transaksi"}</div>
                        <div className="mt-1 text-xs text-slate-400">{formatDateShort(transaction.date)}</div>
                      </div>
                      <div className={cn("text-sm font-bold", transaction.type === "income" ? "text-emerald-600" : transaction.type === "expense" ? "text-rose-500" : "text-slate-700")}>
                        {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}{formatRupiah(transaction.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <SectionHeader title="Anggaran Aktif" actionHref="/budgets" actionLabel="Kelola" />
            {mounted && activeBudgets.length === 0 ? (
              <EmptyPanel
                icon="🎯"
                title="Belum ada anggaran"
                description="Buat anggaran per kategori agar pengeluaran bisa dipantau lebih rapi dan tidak bocor ke area lain."
                actionHref="/budgets"
                actionLabel="Buat anggaran pertama"
                actionHint="Tentukan batas untuk kategori penting seperti makan, transportasi, atau tagihan."
              />
            ) : (
              <div className="space-y-3">
                {mounted && activeBudgets.slice(0, 3).map((budget) => {
                  const category = categories.find((c) => c.id === budget.categoryId);
                  const percentage = budget.limitAmount > 0 ? Math.min(100, (budget.spentAmount / budget.limitAmount) * 100) : 0;
                  return (
                    <div key={budget.id} className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">{category?.icon} {category?.name || "Anggaran"}</div>
                        <div className={cn("text-xs font-semibold", budget.spentAmount > budget.limitAmount ? "text-rose-500" : "text-slate-500")}>
                          {formatRupiah(budget.spentAmount)} / {formatRupiah(budget.limitAmount)}
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={cn("h-full rounded-full transition-all", percentage >= 100 ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <SectionHeader title="Target Tabungan" actionHref="/savings" actionLabel="Kelola" />
            {mounted && activeGoals.length === 0 ? (
              <EmptyPanel
                icon="🐷"
                title="Belum ada target tabungan"
                description="Tambahkan target tabungan supaya progres menabung Anda terasa lebih jelas dan termotivasi."
                actionHref="/savings"
                actionLabel="Tambah target tabungan"
                actionHint="Contoh: dana darurat, gadget baru, liburan, atau biaya pendidikan."
              />
            ) : (
              <div className="space-y-3">
                {mounted && activeGoals.map((goal) => {
                  const percentage = goal.targetAmount > 0 ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100) : 0;
                  return (
                    <div key={goal.id} className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-emerald-50/50 p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">🐷 {goal.name}</div>
                        <div className="text-xs font-semibold text-slate-500">{Math.round(percentage)}%</div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">{formatRupiah(goal.savedAmount)} / {formatRupiah(goal.targetAmount)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
