-- CreateEnum
CREATE TYPE "SafeSpendingStatus" AS ENUM ('safe', 'warning', 'danger');

-- CreateTable
CREATE TABLE "SafeSpendingSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAssets" DECIMAL(18,2) NOT NULL,
    "totalLiabilities" DECIMAL(18,2) NOT NULL,
    "pendingRoutineExpenses" DECIMAL(18,2) NOT NULL,
    "savingsAllocation" DECIMAL(18,2) NOT NULL,
    "priorityBudgetReserve" DECIMAL(18,2) NOT NULL,
    "safeSpending" DECIMAL(18,2) NOT NULL,
    "status" "SafeSpendingStatus" NOT NULL,
    "components" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafeSpendingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SafeSpendingSnapshot_userId_capturedAt_idx" ON "SafeSpendingSnapshot"("userId", "capturedAt");

-- CreateIndex
CREATE INDEX "SafeSpendingSnapshot_userId_periodMonth_idx" ON "SafeSpendingSnapshot"("userId", "periodMonth");

-- AddForeignKey
ALTER TABLE "SafeSpendingSnapshot" ADD CONSTRAINT "SafeSpendingSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;