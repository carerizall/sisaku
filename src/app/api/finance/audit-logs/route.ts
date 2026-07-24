import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapAuditLog } from "@/lib/audit-log";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Anda perlu login terlebih dahulu." }, { status: 401 });

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 100,
    });
    return NextResponse.json({ auditLogs: auditLogs.map((log) => mapAuditLog(log)) });
  } catch (error) {
    console.error("AUDIT_LOG_LIST_ERROR", error);
    return NextResponse.json({ message: "Gagal memuat audit log." }, { status: 500 });
  }
}