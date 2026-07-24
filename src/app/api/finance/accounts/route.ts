import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountClassForType, getFinanceBootstrap } from "@/lib/finance";
import type { AccountStatus, AccountType } from "@prisma/client";
import { trackAnalyticsEvent } from "@/lib/analytics";

const ACCOUNT_TYPES = ["cash", "bank", "ewallet", "credit_card", "other"] as const satisfies readonly AccountType[];
const ACCOUNT_STATUSES = ["active", "archived"] as const satisfies readonly AccountStatus[];

function isAccountType(value: unknown): value is AccountType {
  return typeof value === "string" && ACCOUNT_TYPES.includes(value as AccountType);
}

function isAccountStatus(value: unknown): value is AccountStatus {
  return typeof value === "string" && ACCOUNT_STATUSES.includes(value as AccountStatus);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const body = (await request.json()) as { name?: string; type?: unknown; initialBalance?: number; currency?: string; status?: unknown };
    const name = body.name?.trim();
    const type = isAccountType(body.type) ? body.type : "cash";
    const initialBalance = Number(body.initialBalance ?? 0);
    const status = isAccountStatus(body.status) ? body.status : "active";

    if (!name) return NextResponse.json({ message: "Nama akun wajib diisi." }, { status: 400 });
    if (!Number.isFinite(initialBalance)) return NextResponse.json({ message: "Saldo awal tidak valid." }, { status: 400 });

    await prisma.financialAccount.create({
      data: {
        userId: user.id,
        name,
        type,
        class: accountClassForType(type),
        initialBalance,
        currentBalance: initialBalance,
        currency: body.currency ?? "IDR",
        status,
      },
    });
    trackAnalyticsEvent("financial_account_created", { type, class: accountClassForType(type), status });

    return NextResponse.json(await getFinanceBootstrap(user.id), { status: 201 });
  } catch (error) {
    console.error("ACCOUNT_CREATE_ERROR", error);
    return NextResponse.json({ message: "Gagal membuat akun." }, { status: 500 });
  }
}