-- AlterTable
ALTER TABLE "firms" ADD COLUMN     "clerkOrganizationId" TEXT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "clerkUserId" TEXT;

-- CreateTable
CREATE TABLE "clerk_webhook_receipts" (
    "id" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clerk_webhook_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "firms_clerkOrganizationId_key" ON "firms"("clerkOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_clerkUserId_key" ON "employees"("clerkUserId");
