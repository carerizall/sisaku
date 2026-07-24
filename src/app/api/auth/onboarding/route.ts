import { NextResponse } from "next/server";
import { getCurrentUser, toAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountClassForType, ensureDefaultCategories, getFinanceBootstrap } from "@/lib/finance";
import type { AccountType, Prisma } from "@prisma/client";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });
  }

  const body = (await request.json()) as {
    displayName?: string;
    accounts?: { name?: string; type?: AccountType; initialBalance?: number }[];
    monthlyIncome?: number;
    recurringExpenses?: { name?: string; amount?: number; nextDueDate?: string }[];
    savingsGoal?: { name?: string; targetAmount?: number; targetDate?: string; sourceAccountId?: string } | null;
  };
  const displayName = body.displayName?.trim() || currentUser.displayName;

  await ensureDefaultCategories(currentUser.id);
  const [incomeCategory, expenseCategory] = await Promise.all([
    prisma.category.findFirst({ where: { userId: currentUser.id, type: "income", name: "Gaji" } }),
    prisma.category.findFirst({ where: { userId: currentUser.id, type: "expense", name: "Tagihan" } }),
  ]);

  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedUser = await tx.user.update({
      where: { id: currentUser.id },
      data: { displayName, isOnboarded: true },
    });

    const existingAccountCount = await tx.financialAccount.count({ where: { userId: currentUser.id } });
    let primaryAccountId = body.savingsGoal?.sourceAccountId || undefined;
    
    if (existingAccountCount === 0) {
      // User belum punya akun sama sekali
      const accountsToCreate = body.accounts?.filter((account) => account.name?.trim() && account.type) || [];
      
      // Kalau user tidak submit akun apapun, create akun default "Kas"
      if (accountsToCreate.length === 0) {
        accountsToCreate.push({
          name: "Kas",
          type: "cash" as AccountType,
          initialBalance: 0,
        });
      }

      const createdAccounts = await Promise.all(
        accountsToCreate.map((account) => tx.financialAccount.create({
          data: {
            userId: currentUser.id,
            name: account.name!.trim(),
            type: account.type!,
            class: accountClassForType(account.type!),
            initialBalance: Number(account.initialBalance ?? 0),
            currentBalance: Number(account.initialBalance ?? 0),
            currency: "IDR",
          },
        }))
      );
      primaryAccountId = primaryAccountId || createdAccounts.find((account) => account.class === "asset")?.id || createdAccounts[0]?.id;
    } else {
      primaryAccountId = primaryAccountId || (await tx.financialAccount.findFirst({ where: { userId: currentUser.id, class: "asset" } }))?.id;
    }

    const monthlyIncome = Number(body.monthlyIncome ?? 0);
    if (primaryAccountId && Number.isFinite(monthlyIncome) && monthlyIncome > 0) {
      await tx.transaction.create({
        data: {
          userId: currentUser.id,
          accountId: primaryAccountId,
          type: "income",
          amount: monthlyIncome,
          currency: "IDR",
          categoryId: incomeCategory?.id,
          date: new Date(),
          notes: "Pemasukan utama dari onboarding",
        },
      });
    }

    const validRecurringExpenses = body.recurringExpenses
      ?.filter((expense) => expense.name?.trim() && Number(expense.amount ?? 0) > 0)
      .map((expense) => ({
        userId: currentUser.id,
        name: expense.name!.trim(),
        amount: Number(expense.amount ?? 0),
        categoryId: expenseCategory!.id,
        interval: "monthly" as const,
        nextDueDate: expense.nextDueDate ? new Date(expense.nextDueDate) : new Date(),
      })) ?? [];

    if (expenseCategory?.id && validRecurringExpenses.length > 0) {
      await tx.recurringExpense.createMany({
        data: validRecurringExpenses,
      });
    }

    const goal = body.savingsGoal;
    if (goal?.name?.trim() && Number(goal.targetAmount ?? 0) > 0 && goal.targetDate) {
      await tx.savingsGoal.create({
        data: {
          userId: currentUser.id,
          name: goal.name.trim(),
          targetAmount: Number(goal.targetAmount ?? 0),
          targetDate: new Date(goal.targetDate),
          sourceAccountId: primaryAccountId,
        },
      });
    }

    return updatedUser;
  });

  const finance = await getFinanceBootstrap(currentUser.id);
  trackAnalyticsEvent("onboarding_completed", {
    accounts_created: body.accounts?.length ?? 0,
    recurring_expenses_added: body.recurringExpenses?.length ?? 0,
    has_savings_goal: Boolean(body.savingsGoal?.name),
  });

  return NextResponse.json({ user: toAuthUser(user), finance });
}