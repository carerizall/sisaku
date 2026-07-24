"use client";

import { buildMonthlyReport } from "@/lib/reports";
import { useStore } from "@/lib/store";
import { formatRupiah, cn, getMonthLabel } from "@/lib/utils";
import { useState, useMemo } from "react";

function formatDelta(amount: number) {
  if (amount === 0) return "Tetap";
  return formatRupiah(amount, { sign: true });
}

function deltaTone(amount: number, positiveIsGood = true) {
  if (amount === 0) return "text-slate-500";
  const isGood = positiveIsGood ? amount > 0 : amount < 0;
  return isGood ? "text-emerald-600" : "text-red-500";
}

export default function ReportsPage() {
  const { transactions, categories, accounts } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const report = useMemo(
    () => buildMonthlyReport(transactions, categories, accounts, selectedMonth),
    [accounts, categories, selectedMonth, transactions]
  );

  const maxCategoryAmount = report.expensesByCategory.length > 0 ? report.expensesByCategory[0].amount : 1;
  const incomeExpenseTotal = report.summary.totalIncome + report.summary.totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
        <p className="text-sm text-slate-500">Ringkasan bulanan, grafik kategori, dan insight sederhana</p>
      </div>

      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Periode laporan</div>
          <div className="text-sm font-semibold text-slate-900">{getMonthLabel(report.monthPeriod)}</div>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="ml-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-[10px] text-slate-500">Pemasukan</div>
          <div className="text-sm font-bold text-emerald-600">{formatRupiah(report.summary.totalIncome)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-[10px] text-slate-500">Pengeluaran</div>
          <div className="text-sm font-bold text-red-500">{formatRupiah(report.summary.totalExpense)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-[10px] text-slate-500">Tabungan</div>
          <div className="text-sm font-bold text-blue-600">{formatRupiah(report.summary.totalSavings)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-[10px] text-slate-500">Perubahan Bersih</div>
          <div className={cn("text-sm font-bold", report.summary.netChange >= 0 ? "text-emerald-600" : "text-red-500")}>{formatRupiah(report.summary.netChange)}</div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Dibanding {getMonthLabel(report.previousMonthPeriod)}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500">Pemasukan</div>
            <div className={cn("text-sm font-bold", deltaTone(report.comparison.incomeDelta))}>{formatDelta(report.comparison.incomeDelta)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500">Pengeluaran</div>
            <div className={cn("text-sm font-bold", deltaTone(report.comparison.expenseDelta, false))}>{formatDelta(report.comparison.expenseDelta)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500">Tabungan</div>
            <div className={cn("text-sm font-bold", deltaTone(report.comparison.savingsDelta))}>{formatDelta(report.comparison.savingsDelta)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500">Perubahan Bersih</div>
            <div className={cn("text-sm font-bold", deltaTone(report.comparison.netChangeDelta))}>{formatDelta(report.comparison.netChangeDelta)}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Pengeluaran per Kategori</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          {report.expensesByCategory.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Tidak ada data</p>}
          {report.expensesByCategory.map((category) => (
            <div key={category.categoryId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">{category.icon} {category.name}</span>
                <span className="text-xs font-semibold text-slate-900">
                  {formatRupiah(category.amount)} · {Math.round(category.percentage)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(category.amount / maxCategoryAmount) * 100}%`, backgroundColor: category.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Akun yang Digunakan</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {report.accountUsage.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Tidak ada data</p>}
          {report.accountUsage.map((account) => (
            <div key={account.accountId} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-700">{account.name}</div>
                <div className="text-[10px] text-slate-400">{account.transactionCount} transaksi</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-600">+{formatRupiah(account.income)}</span>
                <span className="text-xs text-red-500 ml-2">-{formatRupiah(account.expense)}</span>
                {account.savings > 0 && <span className="text-xs text-blue-600 ml-2">Tabungan {formatRupiah(account.savings)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Rasio Pemasukan vs Pengeluaran</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          {incomeExpenseTotal === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Tidak ada data</p>
          ) : (
            <>
              <div className="flex h-6 rounded-full overflow-hidden">
                <div className="bg-emerald-500" style={{ width: `${(report.summary.totalIncome / incomeExpenseTotal) * 100}%` }} />
                <div className="bg-red-500" style={{ width: `${(report.summary.totalExpense / incomeExpenseTotal) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-emerald-600">Pemasukan {Math.round((report.summary.totalIncome / incomeExpenseTotal) * 100)}%</span>
                <span className="text-red-500">Pengeluaran {Math.round((report.summary.totalExpense / incomeExpenseTotal) * 100)}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Ringkasan Sederhana</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          {report.insights.map((insight) => (
            <p key={insight} className="text-sm text-slate-600">• {insight}</p>
          ))}
        </div>
      </div>
    </div>
  );
}