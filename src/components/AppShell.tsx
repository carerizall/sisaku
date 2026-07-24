"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-sm" style={{ width: size, height: size }}>
      <Image src="/logo.png" alt="Sisaku" fill sizes={`${size}px`} className="object-cover p-1.5" priority />
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/accounts", label: "Akun", icon: "💳" },
  { href: "/transactions", label: "Transaksi", icon: "📝" },
  { href: "/budgets", label: "Anggaran", icon: "🎯" },
  { href: "/savings", label: "Tabungan", icon: "🐷" },
  { href: "/reports", label: "Laporan", icon: "📊" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { safeSpending, setUser } = useStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isOnboarding = pathname?.startsWith("/onboarding");
  const isAuth = pathname?.startsWith("/auth");

  if (isOnboarding || isAuth) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#d1fae5_0,transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={30} />
          <div>
            <span className="block font-bold text-slate-900 leading-none">Sisaku</span>
            <span className="text-[10px] text-slate-500">Safe Spending</span>
          </div>
        </Link>
        {mounted && safeSpending && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full border",
              safeSpending.status === "safe" && "text-emerald-600 bg-emerald-50 border-emerald-200",
              safeSpending.status === "warning" && "text-amber-600 bg-amber-50 border-amber-200",
              safeSpending.status === "danger" && "text-red-600 bg-red-50 border-red-200"
            )}
          >
            {safeSpending.status === "safe" ? "✅ Aman" : safeSpending.status === "warning" ? "⚠️ Hati-hati" : "🚨 Bahaya"}
          </span>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 flex-col shadow-[10px_0_40px_rgba(15,23,42,0.04)]">
        <div className="p-6 border-b border-slate-200/80">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={40} />
            <div>
              <div className="font-bold text-slate-900">Sisaku</div>
              <div className="text-xs text-slate-500">Safe Spending</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                  active
                    ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {mounted && safeSpending && (
          <div className="p-4 border-t border-slate-200/80">
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Status Keuangan</div>
              <div className={cn(
                "text-sm font-semibold",
                safeSpending.status === "safe" && "text-emerald-600",
                safeSpending.status === "warning" && "text-amber-600",
                safeSpending.status === "danger" && "text-red-600"
              )}>
                {safeSpending.status === "safe" ? "✅ Aman" : safeSpending.status === "warning" ? "⚠️ Hati-hati" : "🚨 Bahaya"}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-200/80">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <span className="text-lg">⚙️</span>
            Pengaturan
          </Link>
          <button onClick={handleLogout} className="mt-1 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50">
            <span className="text-lg">🚪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pb-24 lg:pb-12">
        <div className="mx-auto w-full max-w-[88rem] px-4 py-7 sm:px-6 lg:px-10 lg:py-12 xl:px-12">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200">
        <div className="grid grid-cols-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-emerald-600" : "text-slate-500"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}