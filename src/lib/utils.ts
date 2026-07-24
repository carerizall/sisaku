import type { FinancialStatus } from "./types";
import { DEFAULT_APP_TIMEZONE } from "./timezone.ts";

// ============= CURRENCY FORMATTER =============
export function formatRupiah(amount: number, opts?: { sign?: boolean; compact?: boolean }): string {
  const { sign = false, compact = false } = opts || {};
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: compact ? 0 : 0,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(abs);

  if (sign) {
    return `${amount < 0 ? "-" : "+"} ${formatted}`;
  }
  return amount < 0 ? `- ${formatted}` : formatted;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

// ============= DATE FORMATTER =============
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: DEFAULT_APP_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: DEFAULT_APP_TIMEZONE,
    day: "numeric",
    month: "short",
  }).format(d);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: DEFAULT_APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function getMonthLabel(monthPeriod: string): string {
  const [year, month] = monthPeriod.split("-");
  const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
  return new Intl.DateTimeFormat("id-ID", { timeZone: DEFAULT_APP_TIMEZONE, month: "long", year: "numeric" }).format(d);
}

// ============= STATUS COLORS =============
export function getStatusColor(status: FinancialStatus): string {
  switch (status) {
    case "safe":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "warning":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "danger":
      return "text-red-600 bg-red-50 border-red-200";
  }
}

export function getStatusLabel(status: FinancialStatus): string {
  switch (status) {
    case "safe":
      return "Aman";
    case "warning":
      return "Hati-hati";
    case "danger":
      return "Bahaya";
  }
}

export function getStatusIcon(status: FinancialStatus): string {
  switch (status) {
    case "safe":
      return "✅";
    case "warning":
      return "⚠️";
    case "danger":
      return "🚨";
  }
}

// ============= HELPER =============
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function todayISODate(): string {
  return new Date().toISOString();
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysInMonth(monthPeriod: string): number {
  const [year, month] = monthPeriod.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export function getProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}