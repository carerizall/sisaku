"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import type {
  User,
  FinancialAccount,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  RecurringExpense,
  SafeSpendingSnapshot,
  AccountType,
  AccountClass,
} from "./types";
import { calculateAccountBalances, calculateSafeSpending } from "./safe-spending";

// ============= DEFAULT CATEGORIES =============
const DEFAULT_INCOME_CATEGORIES: Omit<Category, "id" | "userId">[] = [
  { name: "Gaji", icon: "💼", color: "#10b981", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Freelance", icon: "💻", color: "#3b82f6", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Bonus", icon: "🎁", color: "#f59e0b", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Hadiah", icon: "🎉", color: "#ec4899", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Refund", icon: "↩️", color: "#8b5cf6", type: "income", group: "other", status: "active", isDefault: true },
  { name: "Lainnya", icon: "📥", color: "#6b7280", type: "income", group: "other", status: "active", isDefault: true },
];

const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, "id" | "userId">[] = [
  { name: "Makan", icon: "🍜", color: "#ef4444", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { name: "Transportasi", icon: "🚗", color: "#3b82f6", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Belanja", icon: "🛍️", color: "#ec4899", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { name: "Hiburan", icon: "🎮", color: "#8b5cf6", type: "expense", group: "lifestyle", status: "active", isDefault: true },
  { name: "Tagihan", icon: "🧾", color: "#f59e0b", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Kesehatan", icon: "🏥", color: "#10b981", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Pendidikan", icon: "📚", color: "#06b6d4", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Keluarga", icon: "👨‍👩‍👧", color: "#f97316", type: "expense", group: "other", status: "active", isDefault: true },
  { name: "Langganan", icon: "📱", color: "#6366f1", type: "expense", group: "needs", status: "active", isDefault: true },
  { name: "Lainnya", icon: "📤", color: "#6b7280", type: "expense", group: "other", status: "active", isDefault: true },
];

// ============= ACCOUNT TYPE CONFIG =============
export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; icon: string; class: AccountClass }> = {
  cash: { label: "Kas", icon: "💵", class: "asset" },
  bank: { label: "Rekening Bank", icon: "🏦", class: "asset" },
  ewallet: { label: "E-Wallet", icon: "📱", class: "asset" },
  credit_card: { label: "Kartu Kredit", icon: "💳", class: "liability" },
  other: { label: "Lainnya", icon: "📦", class: "asset" },
};

// ============= STORE INTERFACE =============
interface StoreContextType {
  user: User | null;
  accounts: FinancialAccount[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
  safeSpending: SafeSpendingSnapshot | null;

  // Actions
  setUser: (user: User | null) => void;
  addAccount: (account: Omit<FinancialAccount, "id" | "userId" | "currentBalance" | "createdAt">) => void;
  updateAccount: (id: string, updates: Partial<FinancialAccount>) => void;
  archiveAccount: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "userId" | "createdAt">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (cat: Omit<Category, "id" | "userId" | "isDefault">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id" | "userId" | "spentAmount" | "status">) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "userId" | "savedAmount" | "status">) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addRecurringExpense: (re: Omit<RecurringExpense, "id" | "userId" | "active">) => void;
  completeOnboarding: () => void;
  resetAllData: () => void;
  loadFinanceData: (data: FinanceBootstrap) => void;
}

type FinanceBootstrap = Pick<
  StoreContextType,
  "accounts" | "categories" | "transactions" | "budgets" | "savingsGoals" | "recurringExpenses"
> & { safeSpending?: SafeSpendingSnapshot | null };

const StoreContext = createContext<StoreContextType | null>(null);

// ============= HELPER =============
const uid = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
const now = () => new Date().toISOString();

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ============= PROVIDER =============
export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initializers to load from localStorage once (client-only)
  const [user, setUserState] = useState<User | null>(() => loadFromStorage("sisaku_user", null));
  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => loadFromStorage("sisaku_accounts", []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage("sisaku_transactions", []));
  const [budgets, setBudgets] = useState<Budget[]>(() => loadFromStorage("sisaku_budgets", []));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => loadFromStorage("sisaku_savingsGoals", []));
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() =>
    loadFromStorage("sisaku_recurringExpenses", [])
  );
  const [serverSafeSpending, setServerSafeSpending] = useState<SafeSpendingSnapshot | null>(null);

  // Client mount detection via useSyncExternalStore (React-recommended pattern, no setState in effect)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Initialize default categories if none — done in lazy initializer to avoid effect
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = loadFromStorage<Category[]>("sisaku_categories", []);
    if (stored.length > 0) return stored;
    const userId = "guest";
    return [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES].map((c) => ({
      ...c,
      id: uid(),
      userId,
    }));
  });

  // ============= DERIVED VALUES (useMemo) =============
  // Recalculate account balances based on transactions
  const computedAccounts = useMemo(() => calculateAccountBalances(accounts, transactions), [accounts, transactions]);

  const computedBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === "expense" && t.categoryId === b.categoryId)
        .filter((t) => t.date.slice(0, 7) === b.monthPeriod)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...b,
        spentAmount: spent,
        status: (spent > b.limitAmount ? "exceeded" : "active") as Budget["status"],
      };
    });
  }, [budgets, transactions]);

  const computedSavingsGoals = useMemo(() => {
    return savingsGoals.map((g) => {
      const saved = transactions
        .filter((t) => t.type === "savings" && t.savingsGoalId === g.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...g,
        savedAmount: saved,
        status: (saved >= g.targetAmount ? "completed" : "active") as SavingsGoal["status"],
      };
    });
  }, [savingsGoals, transactions]);

  const calculatedSafeSpending = useMemo(() => {
    if (!mounted) return null;
    return calculateSafeSpending(computedAccounts, computedBudgets, computedSavingsGoals, recurringExpenses);
  }, [mounted, computedAccounts, computedBudgets, computedSavingsGoals, recurringExpenses]);

  const safeSpending = serverSafeSpending ?? calculatedSafeSpending;

  const applyFinanceBootstrap = useCallback((data: FinanceBootstrap) => {
    setAccounts(data.accounts);
    setCategories(data.categories);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setSavingsGoals(data.savingsGoals);
    setRecurringExpenses(data.recurringExpenses);
    setServerSafeSpending(data.safeSpending ?? null);
  }, []);

  const syncFinance = useCallback(async (endpoint: string, init?: RequestInit) => {
    if (!user?.id) return false;
    try {
      const response = await fetch(endpoint, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });
      if (!response.ok) return false;
      const data = (await response.json()) as FinanceBootstrap;
      applyFinanceBootstrap(data);
      return true;
    } catch {
      return false;
    }
  }, [applyFinanceBootstrap, user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function syncSessionUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;
        const data = (await response.json()) as { user: User | null };
        if (!cancelled) setUserState(data.user);
      } catch {
        // Keep local state when offline/development database is unavailable.
      }
    }

    syncSessionUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted || !user?.id) return;
    const timeoutId = window.setTimeout(() => {
      void syncFinance("/api/finance/bootstrap");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [mounted, syncFinance, user?.id]);

  // Persist raw state to localStorage (valid external system sync)
  useEffect(() => { saveToStorage("sisaku_user", user); }, [user]);
  useEffect(() => { saveToStorage("sisaku_accounts", accounts); }, [accounts]);
  useEffect(() => { saveToStorage("sisaku_transactions", transactions); }, [transactions]);
  useEffect(() => { saveToStorage("sisaku_categories", categories); }, [categories]);
  useEffect(() => { saveToStorage("sisaku_budgets", budgets); }, [budgets]);
  useEffect(() => { saveToStorage("sisaku_savingsGoals", savingsGoals); }, [savingsGoals]);
  useEffect(() => { saveToStorage("sisaku_recurringExpenses", recurringExpenses); }, [recurringExpenses]);

  // ============= ACTIONS =============
  const setUser = useCallback((u: User | null) => setUserState(u), []);

  const addAccount: StoreContextType["addAccount"] = useCallback((account) => {
    if (user?.id) {
      void syncFinance("/api/finance/accounts", { method: "POST", body: JSON.stringify(account) });
      return;
    }
    const newAcc: FinancialAccount = {
      ...account,
      id: uid(),
      userId: user?.id || "guest",
      currentBalance: account.initialBalance,
      createdAt: now(),
    };
    setAccounts((prev) => [...prev, newAcc]);
  }, [syncFinance, user?.id]);

  const updateAccount: StoreContextType["updateAccount"] = useCallback((id, updates) => {
    if (user?.id) {
      void syncFinance(`/api/finance/accounts/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      return;
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, [syncFinance, user?.id]);

  const archiveAccount: StoreContextType["archiveAccount"] = useCallback((id) => {
    if (user?.id) {
      void syncFinance(`/api/finance/accounts/${id}`, { method: "PATCH", body: JSON.stringify({ status: "archived" }) });
      return;
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "archived" } : a)));
  }, [syncFinance, user?.id]);

  const addTransaction: StoreContextType["addTransaction"] = useCallback((tx) => {
    if (user?.id) {
      void syncFinance("/api/finance/transactions", { method: "POST", body: JSON.stringify(tx) });
      return;
    }
    const newTx: Transaction = { ...tx, id: uid(), userId: user?.id || "guest", createdAt: now() };
    setTransactions((prev) => [newTx, ...prev]);
  }, [syncFinance, user?.id]);

  const updateTransaction: StoreContextType["updateTransaction"] = useCallback((id, updates) => {
    if (user?.id) {
      void syncFinance(`/api/finance/transactions/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      return;
    }
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, editedAt: now() } : t)));
  }, [syncFinance, user?.id]);

  const deleteTransaction: StoreContextType["deleteTransaction"] = useCallback((id) => {
    if (user?.id) {
      void syncFinance(`/api/finance/transactions/${id}`, { method: "DELETE" });
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [syncFinance, user?.id]);

  const addCategory: StoreContextType["addCategory"] = useCallback((cat) => {
    if (user?.id) {
      void syncFinance("/api/finance/categories", { method: "POST", body: JSON.stringify(cat) });
      return;
    }
    const newCat: Category = { ...cat, id: uid(), userId: user?.id || "guest", isDefault: false };
    setCategories((prev) => [...prev, newCat]);
  }, [syncFinance, user?.id]);

  const updateCategory: StoreContextType["updateCategory"] = useCallback((id, updates) => {
    if (user?.id) {
      void syncFinance(`/api/finance/categories/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, [syncFinance, user?.id]);

  const deleteCategory: StoreContextType["deleteCategory"] = useCallback((id) => {
    if (user?.id) {
      void syncFinance(`/api/finance/categories/${id}`, { method: "PATCH", body: JSON.stringify({ status: "disabled" }) });
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, status: "disabled" } : c)));
  }, [syncFinance, user?.id]);

  const addBudget: StoreContextType["addBudget"] = useCallback((budget) => {
    if (user?.id) {
      void syncFinance("/api/finance/budgets", { method: "POST", body: JSON.stringify(budget) });
      return;
    }
    const newBudget: Budget = { ...budget, id: uid(), userId: user?.id || "guest", spentAmount: 0, status: "active" };
    setBudgets((prev) => [...prev, newBudget]);
  }, [syncFinance, user?.id]);

  const updateBudget: StoreContextType["updateBudget"] = useCallback((id, updates) => {
    if (user?.id) {
      void syncFinance(`/api/finance/budgets/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      return;
    }
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, [syncFinance, user?.id]);

  const deleteBudget: StoreContextType["deleteBudget"] = useCallback((id) => {
    if (user?.id) {
      void syncFinance(`/api/finance/budgets/${id}`, { method: "DELETE" });
      return;
    }
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, [syncFinance, user?.id]);

  const addSavingsGoal: StoreContextType["addSavingsGoal"] = useCallback((goal) => {
    if (user?.id) {
      void syncFinance("/api/finance/savings-goals", { method: "POST", body: JSON.stringify(goal) });
      return;
    }
    const newGoal: SavingsGoal = { ...goal, id: uid(), userId: user?.id || "guest", savedAmount: 0, status: "active" };
    setSavingsGoals((prev) => [...prev, newGoal]);
  }, [syncFinance, user?.id]);

  const updateSavingsGoal: StoreContextType["updateSavingsGoal"] = useCallback((id, updates) => {
    if (user?.id) {
      void syncFinance(`/api/finance/savings-goals/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      return;
    }
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, [syncFinance, user?.id]);

  const deleteSavingsGoal: StoreContextType["deleteSavingsGoal"] = useCallback((id) => {
    if (user?.id) {
      void syncFinance(`/api/finance/savings-goals/${id}`, { method: "DELETE" });
      return;
    }
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, [syncFinance, user?.id]);

  const addRecurringExpense: StoreContextType["addRecurringExpense"] = useCallback((re) => {
    if (user?.id) {
      void syncFinance("/api/finance/recurring-expenses", { method: "POST", body: JSON.stringify(re) });
      return;
    }
    const newRe: RecurringExpense = { ...re, id: uid(), userId: user?.id || "guest", active: true };
    setRecurringExpenses((prev) => [...prev, newRe]);
  }, [syncFinance, user?.id]);

  const completeOnboarding = useCallback(() => {
    setUserState((prev) => (prev ? { ...prev, isOnboarded: true } : prev));
  }, []);

  const resetAllData = useCallback(() => {
    if (typeof window !== "undefined") {
      ["sisaku_user", "sisaku_accounts", "sisaku_transactions", "sisaku_categories", "sisaku_budgets", "sisaku_savingsGoals", "sisaku_recurringExpenses"].forEach((k) => localStorage.removeItem(k));
    }
    setUserState(null);
    setAccounts([]);
    setTransactions([]);
    setCategories([]);
    setBudgets([]);
    setSavingsGoals([]);
    setRecurringExpenses([]);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        user,
        accounts: computedAccounts,
        transactions,
        categories,
        budgets: computedBudgets,
        savingsGoals: computedSavingsGoals,
        recurringExpenses,
        safeSpending,
        setUser,
        addAccount,
        updateAccount,
        archiveAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addRecurringExpense,
        completeOnboarding,
        resetAllData,
        loadFinanceData: applyFinanceBootstrap,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}