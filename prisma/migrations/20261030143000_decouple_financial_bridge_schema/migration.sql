-- CreateEnum
CREATE TYPE "TitleKind" AS ENUM ('DOWN_PAYMENT', 'INSTALLMENT', 'EXTRA');

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_firmId_remunerationCalculationId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_firmId_financialGenerationId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_firmId_remunerationCalculationId_fkey";

-- DropForeignKey
ALTER TABLE "direct_financial_entries" DROP CONSTRAINT "direct_financial_entries_actorId_fkey";

-- DropForeignKey
ALTER TABLE "direct_financial_entries" DROP CONSTRAINT "direct_financial_entries_firmId_fkey";

-- DropForeignKey
ALTER TABLE "financial_generations" DROP CONSTRAINT "financial_generations_actorId_fkey";

-- DropForeignKey
ALTER TABLE "financial_generations" DROP CONSTRAINT "financial_generations_firmId_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "financial_generations" DROP CONSTRAINT "financial_generations_firmId_fkey";

-- DropForeignKey
ALTER TABLE "financial_generations" DROP CONSTRAINT "financial_generations_firmId_revenueId_fkey";

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_firmId_directEntryId_fkey";

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_firmId_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_firmId_generationId_fkey";

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_firmId_remunerationCalculationId_fkey";

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_titleKindId_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_firmId_directEntryId_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_firmId_generationId_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_firmId_revenueId_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_titleKindId_fkey";

-- DropForeignKey
ALTER TABLE "remuneration_calculations" DROP CONSTRAINT "remuneration_calculations_firmId_contractAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "remuneration_calculations" DROP CONSTRAINT "remuneration_calculations_firmId_fkey";

-- DropForeignKey
ALTER TABLE "remuneration_calculations" DROP CONSTRAINT "remuneration_calculations_firmId_receiptId_fkey";

-- DropIndex
DROP INDEX "attachments_remunerationCalculationId_idx";

-- DropIndex
DROP INDEX "audit_logs_financialGenerationId_idx";

-- DropIndex
DROP INDEX "audit_logs_remunerationCalculationId_idx";

-- DropIndex
DROP INDEX "payables_directEntryId_idx";

-- DropIndex
DROP INDEX "payables_expenseId_idx";

-- DropIndex
DROP INDEX "payables_firmId_remunerationCalculationId_key";

-- DropIndex
DROP INDEX "payables_generationId_idx";

-- DropIndex
DROP INDEX "payables_remunerationCalculationId_idx";

-- DropIndex
DROP INDEX "payables_remunerationCalculationId_key";

-- DropIndex
DROP INDEX "payables_titleKindId_idx";

-- DropIndex
DROP INDEX "receivables_directEntryId_idx";

-- DropIndex
DROP INDEX "receivables_generationId_idx";

-- DropIndex
DROP INDEX "receivables_revenueId_idx";

-- DropIndex
DROP INDEX "receivables_titleKindId_idx";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "remunerationCalculationId",
ADD COLUMN     "remunerationPayableId" INTEGER;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "financialGenerationId",
DROP COLUMN "remunerationCalculationId",
ADD COLUMN     "remunerationPayableId" INTEGER;

-- AlterTable
ALTER TABLE "payables" DROP COLUMN "directEntryId",
DROP COLUMN "expenseId",
DROP COLUMN "generationId",
DROP COLUMN "remunerationCalculationId",
DROP COLUMN "titleKindId",
ADD COLUMN     "kind" "TitleKind" NOT NULL DEFAULT 'INSTALLMENT';

-- AlterTable
ALTER TABLE "receivables" DROP COLUMN "directEntryId",
DROP COLUMN "generationId",
DROP COLUMN "revenueId",
DROP COLUMN "titleKindId",
ADD COLUMN     "kind" "TitleKind" NOT NULL DEFAULT 'INSTALLMENT';

-- DropTable
DROP TABLE "direct_financial_entries";

-- DropTable
DROP TABLE "financial_generations";

-- DropTable
DROP TABLE "ref_title_kinds";

-- DropTable
DROP TABLE "remuneration_calculations";

-- CreateTable
CREATE TABLE "contract_revenue_receivables" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "revenueId" INTEGER NOT NULL,
    "receivableId" INTEGER NOT NULL,

    CONSTRAINT "contract_revenue_receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_payables" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "payableId" INTEGER NOT NULL,

    CONSTRAINT "expense_payables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remuneration_payables" (
    "id" SERIAL NOT NULL,
    "calculationBase" DECIMAL(14,2) NOT NULL,
    "effectivePercentage" DECIMAL(5,4) NOT NULL,
    "calculatedAmount" DECIMAL(14,2) NOT NULL,
    "computedDueDate" DATE NOT NULL,
    "ruleSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "contractAssignmentId" INTEGER NOT NULL,
    "payableId" INTEGER NOT NULL,

    CONSTRAINT "remuneration_payables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_revenue_receivables_receivableId_key" ON "contract_revenue_receivables"("receivableId");

-- CreateIndex
CREATE INDEX "contract_revenue_receivables_firmId_idx" ON "contract_revenue_receivables"("firmId");

-- CreateIndex
CREATE INDEX "contract_revenue_receivables_contractId_idx" ON "contract_revenue_receivables"("contractId");

-- CreateIndex
CREATE INDEX "contract_revenue_receivables_revenueId_idx" ON "contract_revenue_receivables"("revenueId");

-- CreateIndex
CREATE INDEX "contract_revenue_receivables_receivableId_idx" ON "contract_revenue_receivables"("receivableId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_revenue_receivables_firmId_id_key" ON "contract_revenue_receivables"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_revenue_receivables_firmId_receivableId_key" ON "contract_revenue_receivables"("firmId", "receivableId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_payables_payableId_key" ON "expense_payables"("payableId");

-- CreateIndex
CREATE INDEX "expense_payables_firmId_idx" ON "expense_payables"("firmId");

-- CreateIndex
CREATE INDEX "expense_payables_expenseId_idx" ON "expense_payables"("expenseId");

-- CreateIndex
CREATE INDEX "expense_payables_payableId_idx" ON "expense_payables"("payableId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_payables_firmId_id_key" ON "expense_payables"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_payables_firmId_payableId_key" ON "expense_payables"("firmId", "payableId");

-- CreateIndex
CREATE UNIQUE INDEX "remuneration_payables_payableId_key" ON "remuneration_payables"("payableId");

-- CreateIndex
CREATE INDEX "remuneration_payables_firmId_idx" ON "remuneration_payables"("firmId");

-- CreateIndex
CREATE INDEX "remuneration_payables_receiptId_idx" ON "remuneration_payables"("receiptId");

-- CreateIndex
CREATE INDEX "remuneration_payables_contractAssignmentId_idx" ON "remuneration_payables"("contractAssignmentId");

-- CreateIndex
CREATE INDEX "remuneration_payables_payableId_idx" ON "remuneration_payables"("payableId");

-- CreateIndex
CREATE UNIQUE INDEX "remuneration_payables_firmId_id_key" ON "remuneration_payables"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "remuneration_payables_firmId_payableId_key" ON "remuneration_payables"("firmId", "payableId");

-- CreateIndex
CREATE UNIQUE INDEX "remuneration_payables_receiptId_contractAssignmentId_key" ON "remuneration_payables"("receiptId", "contractAssignmentId");

-- CreateIndex
CREATE INDEX "attachments_remunerationPayableId_idx" ON "attachments"("remunerationPayableId");

-- CreateIndex
CREATE INDEX "audit_logs_remunerationPayableId_idx" ON "audit_logs"("remunerationPayableId");

-- CreateIndex
CREATE INDEX "payables_kind_idx" ON "payables"("kind");

-- CreateIndex
CREATE INDEX "receivables_kind_idx" ON "receivables"("kind");

-- AddForeignKey
ALTER TABLE "contract_revenue_receivables" ADD CONSTRAINT "contract_revenue_receivables_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_revenue_receivables" ADD CONSTRAINT "contract_revenue_receivables_firmId_contractId_fkey" FOREIGN KEY ("firmId", "contractId") REFERENCES "contracts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_revenue_receivables" ADD CONSTRAINT "contract_revenue_receivables_firmId_revenueId_fkey" FOREIGN KEY ("firmId", "revenueId") REFERENCES "revenues"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_revenue_receivables" ADD CONSTRAINT "contract_revenue_receivables_firmId_receivableId_fkey" FOREIGN KEY ("firmId", "receivableId") REFERENCES "receivables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_payables" ADD CONSTRAINT "expense_payables_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_payables" ADD CONSTRAINT "expense_payables_firmId_expenseId_fkey" FOREIGN KEY ("firmId", "expenseId") REFERENCES "expenses"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_payables" ADD CONSTRAINT "expense_payables_firmId_payableId_fkey" FOREIGN KEY ("firmId", "payableId") REFERENCES "payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_payables" ADD CONSTRAINT "remuneration_payables_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_payables" ADD CONSTRAINT "remuneration_payables_firmId_receiptId_fkey" FOREIGN KEY ("firmId", "receiptId") REFERENCES "receipts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_payables" ADD CONSTRAINT "remuneration_payables_firmId_contractAssignmentId_fkey" FOREIGN KEY ("firmId", "contractAssignmentId") REFERENCES "contract_assignments"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_payables" ADD CONSTRAINT "remuneration_payables_firmId_payableId_fkey" FOREIGN KEY ("firmId", "payableId") REFERENCES "payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_remunerationPayableId_fkey" FOREIGN KEY ("firmId", "remunerationPayableId") REFERENCES "remuneration_payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_remunerationPayableId_fkey" FOREIGN KEY ("firmId", "remunerationPayableId") REFERENCES "remuneration_payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
