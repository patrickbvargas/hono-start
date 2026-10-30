-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_typeId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_clientId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_actorId_fkey";

-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_typeId_fkey";

-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_clientId_fkey";

-- DropForeignKey
ALTER TABLE "contract_employees" DROP CONSTRAINT "contract_employees_assignmentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "contract_employees" DROP CONSTRAINT "contract_employees_contractId_fkey";

-- DropForeignKey
ALTER TABLE "contract_employees" DROP CONSTRAINT "contract_employees_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "contract_employees" DROP CONSTRAINT "contract_employees_firmId_fkey";

-- DropForeignKey
ALTER TABLE "revenues" DROP CONSTRAINT "revenues_contractId_fkey";

-- DropForeignKey
ALTER TABLE "revenues" DROP CONSTRAINT "revenues_typeId_fkey";

-- DropForeignKey
ALTER TABLE "fees" DROP CONSTRAINT "fees_firmId_fkey";

-- DropForeignKey
ALTER TABLE "fees" DROP CONSTRAINT "fees_revenueId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "remunerations" DROP CONSTRAINT "remunerations_contractEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "remunerations" DROP CONSTRAINT "remunerations_feeId_fkey";

-- DropForeignKey
ALTER TABLE "remunerations" DROP CONSTRAINT "remunerations_firmId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_clientId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_contractId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_feeId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_remunerationId_fkey";

-- DropIndex
DROP INDEX "audit_logs_firmId_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_firmId_action_idx";

-- DropIndex
DROP INDEX "audit_logs_firmId_entityType_idx";

-- DropIndex
DROP INDEX "audit_logs_clientId_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_employeeId_createdAt_idx";

-- DropIndex
DROP INDEX "contracts_clientId_idx";

-- DropIndex
DROP INDEX "contracts_deletedAt_idx";

-- DropIndex
DROP INDEX "contracts_isActive_idx";

-- DropIndex
DROP INDEX "contracts_createdAt_idx";

-- DropIndex
DROP INDEX "revenues_typeId_idx";

-- DropIndex
DROP INDEX "revenues_deletedAt_idx";

-- DropIndex
DROP INDEX "revenues_isActive_idx";

-- DropIndex
DROP INDEX "revenues_createdAt_idx";

-- DropIndex
DROP INDEX "expenses_categoryId_idx";

-- DropIndex
DROP INDEX "expenses_expenseDate_idx";

-- DropIndex
DROP INDEX "expenses_deletedAt_idx";

-- DropIndex
DROP INDEX "expenses_isActive_idx";

-- DropIndex
DROP INDEX "expenses_createdAt_idx";

-- DropIndex
DROP INDEX "attachments_clientId_idx";

-- DropIndex
DROP INDEX "attachments_employeeId_idx";

-- DropIndex
DROP INDEX "attachments_feeId_idx";

-- DropIndex
DROP INDEX "attachments_remunerationId_idx";

-- DropIndex
DROP INDEX "attachments_deletedAt_idx";

-- DropIndex
DROP INDEX "attachments_isActive_idx";

-- DropIndex
DROP INDEX "attachments_createdAt_idx";

-- AlterTable
ALTER TABLE "firms" ADD COLUMN     "remunerationCutoffDay" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "remunerationDueDay" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "clientId",
DROP COLUMN "employeeId",
ADD COLUMN     "contractId" INTEGER,
ADD COLUMN     "expenseId" INTEGER,
ADD COLUMN     "financialGenerationId" INTEGER,
ADD COLUMN     "payableId" INTEGER,
ADD COLUMN     "paymentId" INTEGER,
ADD COLUMN     "personId" INTEGER,
ADD COLUMN     "receiptId" INTEGER,
ADD COLUMN     "receivableId" INTEGER,
ADD COLUMN     "remunerationCalculationId" INTEGER;

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "clientId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "revenues" DROP COLUMN "downPaymentValue",
DROP COLUMN "paymentStartDate",
DROP COLUMN "totalInstallments",
DROP COLUMN "totalValue",
DROP COLUMN "typeId",
ADD COLUMN     "negotiatedAmount" DECIMAL(14,2) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "revenueTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "amount",
DROP COLUMN "categoryId",
DROP COLUMN "expenseDate",
ADD COLUMN     "negotiatedAmount" DECIMAL(14,2) NOT NULL,
ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "clientId",
DROP COLUMN "employeeId",
DROP COLUMN "feeId",
DROP COLUMN "remunerationId",
ADD COLUMN     "payableId" INTEGER,
ADD COLUMN     "paymentId" INTEGER,
ADD COLUMN     "personId" INTEGER,
ADD COLUMN     "receiptId" INTEGER,
ADD COLUMN     "receivableId" INTEGER,
ADD COLUMN     "remunerationCalculationId" INTEGER;

-- DropTable
DROP TABLE "client_types";

-- DropTable
DROP TABLE "user_roles";

-- DropTable
DROP TABLE "expense_categories";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "clients";

-- DropTable
DROP TABLE "contract_employees";

-- DropTable
DROP TABLE "fees";

-- DropTable
DROP TABLE "remunerations";

-- CreateTable
CREATE TABLE "person_types" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "person_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_analytics" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "financial_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "title_kinds" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "title_kinds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isCustomer" BOOLEAN NOT NULL DEFAULT false,
    "isSupplier" BOOLEAN NOT NULL DEFAULT false,
    "isEmployee" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "personTypeId" INTEGER NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" SERIAL NOT NULL,
    "oabNumber" TEXT,
    "remunerationPercentage" DECIMAL(5,4) NOT NULL,
    "referralPercentage" DECIMAL(5,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "personId" INTEGER NOT NULL,
    "employeeTypeId" INTEGER NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_assignments" (
    "id" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "firmId" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "employeeProfileId" INTEGER NOT NULL,
    "assignmentTypeId" INTEGER NOT NULL,

    CONSTRAINT "contract_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_generations" (
    "id" SERIAL NOT NULL,
    "requestKey" TEXT NOT NULL,
    "agreedAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "revenueId" INTEGER,
    "expenseId" INTEGER,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "financial_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_financial_entries" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "direct_financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivables" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firmId" INTEGER NOT NULL,
    "debtorId" INTEGER NOT NULL,
    "analyticId" INTEGER NOT NULL,
    "expectedPaymentMethodId" INTEGER NOT NULL,
    "titleKindId" INTEGER NOT NULL,
    "generationId" INTEGER,
    "directEntryId" INTEGER,
    "revenueId" INTEGER,

    CONSTRAINT "receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payables" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firmId" INTEGER NOT NULL,
    "beneficiaryId" INTEGER NOT NULL,
    "analyticId" INTEGER NOT NULL,
    "expectedPaymentMethodId" INTEGER NOT NULL,
    "titleKindId" INTEGER NOT NULL,
    "generationId" INTEGER,
    "directEntryId" INTEGER,
    "expenseId" INTEGER,
    "remunerationCalculationId" INTEGER,

    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" SERIAL NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "principalAbated" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "interest" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "penalty" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "effectiveAmount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "requestKey" TEXT NOT NULL,
    "generatesRemuneration" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "receivableId" INTEGER NOT NULL,
    "actualPaymentMethodId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_reversals" (
    "id" SERIAL NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "receipt_reversals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "principalAbated" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "interest" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "penalty" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "effectiveAmount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "requestKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "payableId" INTEGER NOT NULL,
    "actualPaymentMethodId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_reversals" (
    "id" SERIAL NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,

    CONSTRAINT "payment_reversals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remuneration_calculations" (
    "id" SERIAL NOT NULL,
    "calculationBase" DECIMAL(14,2) NOT NULL,
    "effectivePercentage" DECIMAL(5,4) NOT NULL,
    "calculatedAmount" DECIMAL(14,2) NOT NULL,
    "computedDueDate" DATE NOT NULL,
    "generationMode" TEXT NOT NULL DEFAULT 'AUTOMATIC',
    "ruleSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firmId" INTEGER NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "contractAssignmentId" INTEGER NOT NULL,

    CONSTRAINT "remuneration_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_types_value_key" ON "person_types"("value");

-- CreateIndex
CREATE UNIQUE INDEX "financial_analytics_value_key" ON "financial_analytics"("value");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_value_key" ON "payment_methods"("value");

-- CreateIndex
CREATE UNIQUE INDEX "title_kinds_value_key" ON "title_kinds"("value");

-- CreateIndex
CREATE UNIQUE INDEX "people_document_key" ON "people"("document");

-- CreateIndex
CREATE INDEX "people_fullName_id_idx" ON "people"("fullName", "id");

-- CreateIndex
CREATE INDEX "people_deletedAt_idx" ON "people"("deletedAt");

-- CreateIndex
CREATE INDEX "people_personTypeId_idx" ON "people"("personTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_oabNumber_key" ON "employee_profiles"("oabNumber");

-- CreateIndex
CREATE INDEX "employee_profiles_personId_idx" ON "employee_profiles"("personId");

-- CreateIndex
CREATE INDEX "employee_profiles_employeeTypeId_idx" ON "employee_profiles"("employeeTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_personId_key" ON "employee_profiles"("personId");

-- CreateIndex
CREATE INDEX "contract_assignments_firmId_idx" ON "contract_assignments"("firmId");

-- CreateIndex
CREATE INDEX "contract_assignments_contractId_idx" ON "contract_assignments"("contractId");

-- CreateIndex
CREATE INDEX "contract_assignments_employeeProfileId_idx" ON "contract_assignments"("employeeProfileId");

-- CreateIndex
CREATE INDEX "contract_assignments_assignmentTypeId_idx" ON "contract_assignments"("assignmentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_assignments_firmId_id_key" ON "contract_assignments"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_assignments_contractId_employeeProfileId_assignmen_key" ON "contract_assignments"("contractId", "employeeProfileId", "assignmentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_generations_requestKey_key" ON "financial_generations"("requestKey");

-- CreateIndex
CREATE INDEX "financial_generations_firmId_idx" ON "financial_generations"("firmId");

-- CreateIndex
CREATE INDEX "financial_generations_revenueId_idx" ON "financial_generations"("revenueId");

-- CreateIndex
CREATE INDEX "financial_generations_expenseId_idx" ON "financial_generations"("expenseId");

-- CreateIndex
CREATE INDEX "financial_generations_actorId_idx" ON "financial_generations"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_generations_firmId_id_key" ON "financial_generations"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_generations_revenueId_key" ON "financial_generations"("revenueId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_generations_expenseId_key" ON "financial_generations"("expenseId");

-- CreateIndex
CREATE INDEX "direct_financial_entries_firmId_idx" ON "direct_financial_entries"("firmId");

-- CreateIndex
CREATE INDEX "direct_financial_entries_actorId_idx" ON "direct_financial_entries"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "direct_financial_entries_firmId_id_key" ON "direct_financial_entries"("firmId", "id");

-- CreateIndex
CREATE INDEX "receivables_firmId_dueDate_id_idx" ON "receivables"("firmId", "dueDate", "id");

-- CreateIndex
CREATE INDEX "receivables_firmId_idx" ON "receivables"("firmId");

-- CreateIndex
CREATE INDEX "receivables_debtorId_idx" ON "receivables"("debtorId");

-- CreateIndex
CREATE INDEX "receivables_analyticId_idx" ON "receivables"("analyticId");

-- CreateIndex
CREATE INDEX "receivables_expectedPaymentMethodId_idx" ON "receivables"("expectedPaymentMethodId");

-- CreateIndex
CREATE INDEX "receivables_titleKindId_idx" ON "receivables"("titleKindId");

-- CreateIndex
CREATE INDEX "receivables_generationId_idx" ON "receivables"("generationId");

-- CreateIndex
CREATE INDEX "receivables_directEntryId_idx" ON "receivables"("directEntryId");

-- CreateIndex
CREATE INDEX "receivables_revenueId_idx" ON "receivables"("revenueId");

-- CreateIndex
CREATE UNIQUE INDEX "receivables_firmId_id_key" ON "receivables"("firmId", "id");

-- CreateIndex
CREATE INDEX "payables_firmId_dueDate_id_idx" ON "payables"("firmId", "dueDate", "id");

-- CreateIndex
CREATE INDEX "payables_firmId_idx" ON "payables"("firmId");

-- CreateIndex
CREATE INDEX "payables_beneficiaryId_idx" ON "payables"("beneficiaryId");

-- CreateIndex
CREATE INDEX "payables_analyticId_idx" ON "payables"("analyticId");

-- CreateIndex
CREATE INDEX "payables_expectedPaymentMethodId_idx" ON "payables"("expectedPaymentMethodId");

-- CreateIndex
CREATE INDEX "payables_titleKindId_idx" ON "payables"("titleKindId");

-- CreateIndex
CREATE INDEX "payables_generationId_idx" ON "payables"("generationId");

-- CreateIndex
CREATE INDEX "payables_directEntryId_idx" ON "payables"("directEntryId");

-- CreateIndex
CREATE INDEX "payables_expenseId_idx" ON "payables"("expenseId");

-- CreateIndex
CREATE INDEX "payables_remunerationCalculationId_idx" ON "payables"("remunerationCalculationId");

-- CreateIndex
CREATE UNIQUE INDEX "payables_firmId_id_key" ON "payables"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payables_remunerationCalculationId_key" ON "payables"("remunerationCalculationId");

-- CreateIndex
CREATE INDEX "receipts_firmId_effectiveDate_id_idx" ON "receipts"("firmId", "effectiveDate", "id");

-- CreateIndex
CREATE INDEX "receipts_firmId_idx" ON "receipts"("firmId");

-- CreateIndex
CREATE INDEX "receipts_receivableId_idx" ON "receipts"("receivableId");

-- CreateIndex
CREATE INDEX "receipts_actualPaymentMethodId_idx" ON "receipts"("actualPaymentMethodId");

-- CreateIndex
CREATE INDEX "receipts_actorId_idx" ON "receipts"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_firmId_id_key" ON "receipts"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_firmId_requestKey_receivableId_key" ON "receipts"("firmId", "requestKey", "receivableId");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_reversals_requestKey_key" ON "receipt_reversals"("requestKey");

-- CreateIndex
CREATE INDEX "receipt_reversals_firmId_idx" ON "receipt_reversals"("firmId");

-- CreateIndex
CREATE INDEX "receipt_reversals_receiptId_idx" ON "receipt_reversals"("receiptId");

-- CreateIndex
CREATE INDEX "receipt_reversals_actorId_idx" ON "receipt_reversals"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_reversals_firmId_id_key" ON "receipt_reversals"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_reversals_receiptId_key" ON "receipt_reversals"("receiptId");

-- CreateIndex
CREATE INDEX "payments_firmId_effectiveDate_id_idx" ON "payments"("firmId", "effectiveDate", "id");

-- CreateIndex
CREATE INDEX "payments_firmId_idx" ON "payments"("firmId");

-- CreateIndex
CREATE INDEX "payments_payableId_idx" ON "payments"("payableId");

-- CreateIndex
CREATE INDEX "payments_actualPaymentMethodId_idx" ON "payments"("actualPaymentMethodId");

-- CreateIndex
CREATE INDEX "payments_actorId_idx" ON "payments"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_firmId_id_key" ON "payments"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_firmId_requestKey_payableId_key" ON "payments"("firmId", "requestKey", "payableId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reversals_requestKey_key" ON "payment_reversals"("requestKey");

-- CreateIndex
CREATE INDEX "payment_reversals_firmId_idx" ON "payment_reversals"("firmId");

-- CreateIndex
CREATE INDEX "payment_reversals_paymentId_idx" ON "payment_reversals"("paymentId");

-- CreateIndex
CREATE INDEX "payment_reversals_actorId_idx" ON "payment_reversals"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reversals_firmId_id_key" ON "payment_reversals"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reversals_paymentId_key" ON "payment_reversals"("paymentId");

-- CreateIndex
CREATE INDEX "remuneration_calculations_firmId_idx" ON "remuneration_calculations"("firmId");

-- CreateIndex
CREATE INDEX "remuneration_calculations_receiptId_idx" ON "remuneration_calculations"("receiptId");

-- CreateIndex
CREATE INDEX "remuneration_calculations_contractAssignmentId_idx" ON "remuneration_calculations"("contractAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "remuneration_calculations_firmId_id_key" ON "remuneration_calculations"("firmId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "remuneration_calculations_receiptId_contractAssignmentId_key" ON "remuneration_calculations"("receiptId", "contractAssignmentId");

-- CreateIndex
CREATE INDEX "audit_logs_firmId_createdAt_id_idx" ON "audit_logs"("firmId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "audit_logs_firmId_idx" ON "audit_logs"("firmId");

-- CreateIndex
CREATE INDEX "audit_logs_personId_idx" ON "audit_logs"("personId");

-- CreateIndex
CREATE INDEX "audit_logs_contractId_idx" ON "audit_logs"("contractId");

-- CreateIndex
CREATE INDEX "audit_logs_expenseId_idx" ON "audit_logs"("expenseId");

-- CreateIndex
CREATE INDEX "audit_logs_receivableId_idx" ON "audit_logs"("receivableId");

-- CreateIndex
CREATE INDEX "audit_logs_payableId_idx" ON "audit_logs"("payableId");

-- CreateIndex
CREATE INDEX "audit_logs_receiptId_idx" ON "audit_logs"("receiptId");

-- CreateIndex
CREATE INDEX "audit_logs_paymentId_idx" ON "audit_logs"("paymentId");

-- CreateIndex
CREATE INDEX "audit_logs_financialGenerationId_idx" ON "audit_logs"("financialGenerationId");

-- CreateIndex
CREATE INDEX "audit_logs_remunerationCalculationId_idx" ON "audit_logs"("remunerationCalculationId");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_firmId_id_key" ON "audit_logs"("firmId", "id");

-- CreateIndex
CREATE INDEX "contracts_customerId_idx" ON "contracts"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_firmId_id_key" ON "contracts"("firmId", "id");

-- CreateIndex
CREATE INDEX "revenues_revenueTypeId_idx" ON "revenues"("revenueTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "revenues_firmId_id_key" ON "revenues"("firmId", "id");

-- CreateIndex
CREATE INDEX "expenses_supplierId_idx" ON "expenses"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_firmId_id_key" ON "expenses"("firmId", "id");

-- CreateIndex
CREATE INDEX "attachments_personId_idx" ON "attachments"("personId");

-- CreateIndex
CREATE INDEX "attachments_receivableId_idx" ON "attachments"("receivableId");

-- CreateIndex
CREATE INDEX "attachments_payableId_idx" ON "attachments"("payableId");

-- CreateIndex
CREATE INDEX "attachments_receiptId_idx" ON "attachments"("receiptId");

-- CreateIndex
CREATE INDEX "attachments_paymentId_idx" ON "attachments"("paymentId");

-- CreateIndex
CREATE INDEX "attachments_remunerationCalculationId_idx" ON "attachments"("remunerationCalculationId");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_firmId_id_key" ON "attachments"("firmId", "id");

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_personTypeId_fkey" FOREIGN KEY ("personTypeId") REFERENCES "person_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_employeeTypeId_fkey" FOREIGN KEY ("employeeTypeId") REFERENCES "employee_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_assignments" ADD CONSTRAINT "contract_assignments_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_assignments" ADD CONSTRAINT "contract_assignments_firmId_contractId_fkey" FOREIGN KEY ("firmId", "contractId") REFERENCES "contracts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_assignments" ADD CONSTRAINT "contract_assignments_employeeProfileId_fkey" FOREIGN KEY ("employeeProfileId") REFERENCES "employee_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_assignments" ADD CONSTRAINT "contract_assignments_assignmentTypeId_fkey" FOREIGN KEY ("assignmentTypeId") REFERENCES "assignment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_firmId_contractId_fkey" FOREIGN KEY ("firmId", "contractId") REFERENCES "contracts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_revenueTypeId_fkey" FOREIGN KEY ("revenueTypeId") REFERENCES "revenue_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_generations" ADD CONSTRAINT "financial_generations_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_generations" ADD CONSTRAINT "financial_generations_firmId_revenueId_fkey" FOREIGN KEY ("firmId", "revenueId") REFERENCES "revenues"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_generations" ADD CONSTRAINT "financial_generations_firmId_expenseId_fkey" FOREIGN KEY ("firmId", "expenseId") REFERENCES "expenses"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_generations" ADD CONSTRAINT "financial_generations_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_financial_entries" ADD CONSTRAINT "direct_financial_entries_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_financial_entries" ADD CONSTRAINT "direct_financial_entries_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_analyticId_fkey" FOREIGN KEY ("analyticId") REFERENCES "financial_analytics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_expectedPaymentMethodId_fkey" FOREIGN KEY ("expectedPaymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_titleKindId_fkey" FOREIGN KEY ("titleKindId") REFERENCES "title_kinds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_firmId_generationId_fkey" FOREIGN KEY ("firmId", "generationId") REFERENCES "financial_generations"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_firmId_directEntryId_fkey" FOREIGN KEY ("firmId", "directEntryId") REFERENCES "direct_financial_entries"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_firmId_revenueId_fkey" FOREIGN KEY ("firmId", "revenueId") REFERENCES "revenues"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_analyticId_fkey" FOREIGN KEY ("analyticId") REFERENCES "financial_analytics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_expectedPaymentMethodId_fkey" FOREIGN KEY ("expectedPaymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_titleKindId_fkey" FOREIGN KEY ("titleKindId") REFERENCES "title_kinds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_firmId_generationId_fkey" FOREIGN KEY ("firmId", "generationId") REFERENCES "financial_generations"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_firmId_directEntryId_fkey" FOREIGN KEY ("firmId", "directEntryId") REFERENCES "direct_financial_entries"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_firmId_expenseId_fkey" FOREIGN KEY ("firmId", "expenseId") REFERENCES "expenses"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_firmId_remunerationCalculationId_fkey" FOREIGN KEY ("firmId", "remunerationCalculationId") REFERENCES "remuneration_calculations"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_firmId_receivableId_fkey" FOREIGN KEY ("firmId", "receivableId") REFERENCES "receivables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_actualPaymentMethodId_fkey" FOREIGN KEY ("actualPaymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_reversals" ADD CONSTRAINT "receipt_reversals_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_reversals" ADD CONSTRAINT "receipt_reversals_firmId_receiptId_fkey" FOREIGN KEY ("firmId", "receiptId") REFERENCES "receipts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_reversals" ADD CONSTRAINT "receipt_reversals_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_firmId_payableId_fkey" FOREIGN KEY ("firmId", "payableId") REFERENCES "payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_actualPaymentMethodId_fkey" FOREIGN KEY ("actualPaymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_reversals" ADD CONSTRAINT "payment_reversals_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_reversals" ADD CONSTRAINT "payment_reversals_firmId_paymentId_fkey" FOREIGN KEY ("firmId", "paymentId") REFERENCES "payments"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_reversals" ADD CONSTRAINT "payment_reversals_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_calculations" ADD CONSTRAINT "remuneration_calculations_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_calculations" ADD CONSTRAINT "remuneration_calculations_firmId_receiptId_fkey" FOREIGN KEY ("firmId", "receiptId") REFERENCES "receipts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneration_calculations" ADD CONSTRAINT "remuneration_calculations_firmId_contractAssignmentId_fkey" FOREIGN KEY ("firmId", "contractAssignmentId") REFERENCES "contract_assignments"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_contractId_fkey" FOREIGN KEY ("firmId", "contractId") REFERENCES "contracts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_expenseId_fkey" FOREIGN KEY ("firmId", "expenseId") REFERENCES "expenses"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_receivableId_fkey" FOREIGN KEY ("firmId", "receivableId") REFERENCES "receivables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_payableId_fkey" FOREIGN KEY ("firmId", "payableId") REFERENCES "payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_receiptId_fkey" FOREIGN KEY ("firmId", "receiptId") REFERENCES "receipts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_paymentId_fkey" FOREIGN KEY ("firmId", "paymentId") REFERENCES "payments"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_remunerationCalculationId_fkey" FOREIGN KEY ("firmId", "remunerationCalculationId") REFERENCES "remuneration_calculations"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_contractId_fkey" FOREIGN KEY ("firmId", "contractId") REFERENCES "contracts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_expenseId_fkey" FOREIGN KEY ("firmId", "expenseId") REFERENCES "expenses"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_receivableId_fkey" FOREIGN KEY ("firmId", "receivableId") REFERENCES "receivables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_payableId_fkey" FOREIGN KEY ("firmId", "payableId") REFERENCES "payables"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_receiptId_fkey" FOREIGN KEY ("firmId", "receiptId") REFERENCES "receipts"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_paymentId_fkey" FOREIGN KEY ("firmId", "paymentId") REFERENCES "payments"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_financialGenerationId_fkey" FOREIGN KEY ("firmId", "financialGenerationId") REFERENCES "financial_generations"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_remunerationCalculationId_fkey" FOREIGN KEY ("firmId", "remunerationCalculationId") REFERENCES "remuneration_calculations"("firmId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain invariants beyond Prisma's relational schema.
ALTER TABLE people ADD CONSTRAINT people_document_check CHECK (document ~ '^([0-9]{11}|[0-9]{14})$');
ALTER TABLE employee_profiles ADD CONSTRAINT profile_percentages_check CHECK ("remunerationPercentage" BETWEEN 0 AND 1 AND "referralPercentage" BETWEEN 0 AND "remunerationPercentage");
ALTER TABLE firms ADD CONSTRAINT remuneration_days_check CHECK ("remunerationCutoffDay" BETWEEN 1 AND 31 AND "remunerationDueDay" BETWEEN 1 AND 31);
ALTER TABLE contracts ADD CONSTRAINT contract_percentage_check CHECK ("feePercentage" BETWEEN 0 AND 1);
ALTER TABLE financial_generations ADD CONSTRAINT generation_origin_check CHECK (num_nonnulls("revenueId", "expenseId") = 1 AND "agreedAmount" > 0);
ALTER TABLE receivables ADD CONSTRAINT receivable_origin_check CHECK (num_nonnulls("revenueId", "directEntryId") = 1 AND ("generationId" IS NULL OR "revenueId" IS NOT NULL));
ALTER TABLE payables ADD CONSTRAINT payable_origin_check CHECK (num_nonnulls("expenseId", "directEntryId", "remunerationCalculationId") = 1 AND ("generationId" IS NULL OR "expenseId" IS NOT NULL));
ALTER TABLE attachments ADD CONSTRAINT attachment_owner_check CHECK (num_nonnulls("personId", "contractId", "expenseId", "receivableId", "payableId", "receiptId", "paymentId", "remunerationCalculationId") = 1 AND "fileSize" > 0);
ALTER TABLE remuneration_calculations ADD CONSTRAINT calculation_amounts_check CHECK ("calculationBase" > 0 AND "effectivePercentage" BETWEEN 0 AND 1 AND "calculatedAmount" > 0 AND "calculatedAmount" = round("calculationBase" * "effectivePercentage", 2));
CREATE FUNCTION reject_financial_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Confirmed financial events are immutable'; END $$;
ALTER TABLE revenues ADD CONSTRAINT revenues_amount_check CHECK ("negotiatedAmount" > 0);
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_check CHECK ("negotiatedAmount" > 0);
ALTER TABLE receivables ADD CONSTRAINT receivables_amount_check CHECK (amount > 0 AND (("cancelledAt" IS NULL AND "cancellationReason" IS NULL) OR ("cancelledAt" IS NOT NULL AND length(trim("cancellationReason")) > 0)));
ALTER TABLE payables ADD CONSTRAINT payables_amount_check CHECK (amount > 0 AND (("cancelledAt" IS NULL AND "cancellationReason" IS NULL) OR ("cancelledAt" IS NOT NULL AND length(trim("cancellationReason")) > 0)));
ALTER TABLE receipts ADD CONSTRAINT receipts_amounts_check CHECK ("principalAbated" > 0 AND discount BETWEEN 0 AND "principalAbated" AND interest >= 0 AND penalty >= 0 AND "effectiveAmount" >= 0 AND "effectiveAmount" = "principalAbated" - discount + interest + penalty AND ((discount=0 AND interest=0 AND penalty=0) OR length(trim(reason))>0));
CREATE FUNCTION validate_receipts() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE face numeric; cancelled timestamp; abated numeric;
BEGIN
 SELECT amount, "cancelledAt" INTO face, cancelled FROM receivables WHERE id=NEW."receivableId" AND "firmId"=NEW."firmId" FOR UPDATE;
 IF face IS NULL OR cancelled IS NOT NULL THEN RAISE EXCEPTION 'Invalid or cancelled title'; END IF;
 SELECT coalesce(sum(s."principalAbated"),0) INTO abated FROM receipts s WHERE s."receivableId"=NEW."receivableId" AND NOT EXISTS (SELECT 1 FROM receipt_reversals r WHERE r."receiptId"=s.id);
 IF abated+NEW."principalAbated">face THEN RAISE EXCEPTION 'Principal exceeds outstanding balance'; END IF;
 IF NEW."effectiveDate">(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'Future settlement date'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_receipts BEFORE INSERT ON receipts FOR EACH ROW EXECUTE FUNCTION validate_receipts();
CREATE TRIGGER immutable_receipts BEFORE UPDATE OR DELETE ON receipts FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
ALTER TABLE receipt_reversals ADD CONSTRAINT receipt_reversals_reason_check CHECK (length(trim(reason)) > 0);
CREATE TRIGGER immutable_receipt_reversals BEFORE UPDATE OR DELETE ON receipt_reversals FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
CREATE FUNCTION validate_receivables_adjustment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE abated numeric; valid_count int;
BEGIN
 SELECT coalesce(sum(s."principalAbated"),0), count(*) INTO abated, valid_count FROM receipts s WHERE s."receivableId"=OLD.id AND NOT EXISTS(SELECT 1 FROM receipt_reversals r WHERE r."receiptId"=s.id);
 IF NEW.amount<abated OR (NEW."cancelledAt" IS NOT NULL AND valid_count>0) OR (NEW."debtorId"<>OLD."debtorId" AND valid_count>0) THEN RAISE EXCEPTION 'Title adjustment conflicts with settlements'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_receivables_adjustment BEFORE UPDATE ON receivables FOR EACH ROW EXECUTE FUNCTION validate_receivables_adjustment();
CREATE FUNCTION validate_receipt_reversals() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE original_date date;
BEGIN
 SELECT s."effectiveDate" INTO original_date FROM receipts s JOIN receivables t ON t.id=s."receivableId" WHERE s.id=NEW."receiptId" FOR UPDATE OF t;
 IF NEW."effectiveDate"<original_date OR NEW."effectiveDate">(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'Invalid reversal date'; END IF;
 IF EXISTS(SELECT 1 FROM remuneration_calculations c JOIN payables p ON p."remunerationCalculationId"=c.id JOIN payments x ON x."payableId"=p.id WHERE c."receiptId"=NEW."receiptId" AND NOT EXISTS(SELECT 1 FROM payment_reversals r WHERE r."paymentId"=x.id)) THEN RAISE EXCEPTION 'Reverse remuneration payments first'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_receipt_reversals BEFORE INSERT ON receipt_reversals FOR EACH ROW EXECUTE FUNCTION validate_receipt_reversals();
ALTER TABLE payments ADD CONSTRAINT payments_amounts_check CHECK ("principalAbated" > 0 AND discount BETWEEN 0 AND "principalAbated" AND interest >= 0 AND penalty >= 0 AND "effectiveAmount" >= 0 AND "effectiveAmount" = "principalAbated" - discount + interest + penalty AND ((discount=0 AND interest=0 AND penalty=0) OR length(trim(reason))>0));
CREATE FUNCTION validate_payments() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE face numeric; cancelled timestamp; abated numeric;
BEGIN
 SELECT amount, "cancelledAt" INTO face, cancelled FROM payables WHERE id=NEW."payableId" AND "firmId"=NEW."firmId" FOR UPDATE;
 IF face IS NULL OR cancelled IS NOT NULL THEN RAISE EXCEPTION 'Invalid or cancelled title'; END IF;
 SELECT coalesce(sum(s."principalAbated"),0) INTO abated FROM payments s WHERE s."payableId"=NEW."payableId" AND NOT EXISTS (SELECT 1 FROM payment_reversals r WHERE r."paymentId"=s.id);
 IF abated+NEW."principalAbated">face THEN RAISE EXCEPTION 'Principal exceeds outstanding balance'; END IF;
 IF NEW."effectiveDate">(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'Future settlement date'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_payments BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION validate_payments();
CREATE TRIGGER immutable_payments BEFORE UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
ALTER TABLE payment_reversals ADD CONSTRAINT payment_reversals_reason_check CHECK (length(trim(reason)) > 0);
CREATE TRIGGER immutable_payment_reversals BEFORE UPDATE OR DELETE ON payment_reversals FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
CREATE FUNCTION validate_payables_adjustment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE abated numeric; valid_count int;
BEGIN
 SELECT coalesce(sum(s."principalAbated"),0), count(*) INTO abated, valid_count FROM payments s WHERE s."payableId"=OLD.id AND NOT EXISTS(SELECT 1 FROM payment_reversals r WHERE r."paymentId"=s.id);
 IF NEW.amount<abated OR (NEW."cancelledAt" IS NOT NULL AND valid_count>0) OR (NEW."beneficiaryId"<>OLD."beneficiaryId" AND valid_count>0) THEN RAISE EXCEPTION 'Title adjustment conflicts with settlements'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_payables_adjustment BEFORE UPDATE ON payables FOR EACH ROW EXECUTE FUNCTION validate_payables_adjustment();
CREATE FUNCTION validate_payment_reversals() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE original_date date;
BEGIN
 SELECT s."effectiveDate" INTO original_date FROM payments s JOIN payables t ON t.id=s."payableId" WHERE s.id=NEW."paymentId" FOR UPDATE OF t;
 IF NEW."effectiveDate"<original_date OR NEW."effectiveDate">(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'Invalid reversal date'; END IF;
 
 RETURN NEW;
END $$;
CREATE TRIGGER validate_payment_reversals BEFORE INSERT ON payment_reversals FOR EACH ROW EXECUTE FUNCTION validate_payment_reversals();

CREATE FUNCTION validate_generation_titles() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE title_sum numeric; mismatches int;
BEGIN
 IF NEW."revenueId" IS NOT NULL THEN
 SELECT coalesce(sum(amount),0),count(*) FILTER(WHERE "revenueId" IS DISTINCT FROM NEW."revenueId") INTO title_sum,mismatches FROM receivables WHERE "generationId"=NEW.id;
 IF NEW."agreedAmount"<>(SELECT "negotiatedAmount" FROM revenues WHERE id=NEW."revenueId") THEN RAISE EXCEPTION 'Stale agreed amount'; END IF;
 ELSE
 SELECT coalesce(sum(amount),0),count(*) FILTER(WHERE "expenseId" IS DISTINCT FROM NEW."expenseId") INTO title_sum,mismatches FROM payables WHERE "generationId"=NEW.id;
 IF NEW."agreedAmount"<>(SELECT "negotiatedAmount" FROM expenses WHERE id=NEW."expenseId") THEN RAISE EXCEPTION 'Stale agreed amount'; END IF;
 END IF;
 IF title_sum<>NEW."agreedAmount" OR mismatches<>0 THEN RAISE EXCEPTION 'Generation must exactly match agreed amount and origin'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER validate_generation_titles AFTER INSERT ON financial_generations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_generation_titles();
CREATE FUNCTION validate_calculation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM receipts s JOIN receivables t ON t.id=s."receivableId" JOIN revenues r ON r.id=t."revenueId" JOIN contract_assignments a ON a."contractId"=r."contractId" WHERE s.id=NEW."receiptId" AND a.id=NEW."contractAssignmentId" AND s."generatesRemuneration" AND s."effectiveAmount">0 AND s."effectiveAmount"=NEW."calculationBase" AND NOT EXISTS(SELECT 1 FROM receipt_reversals v WHERE v."receiptId"=s.id)) THEN RAISE EXCEPTION 'Invalid remuneration source'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_calculation BEFORE INSERT ON remuneration_calculations FOR EACH ROW EXECUTE FUNCTION validate_calculation();
CREATE TRIGGER immutable_calculations BEFORE UPDATE OR DELETE ON remuneration_calculations FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
CREATE TRIGGER immutable_audit BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
CREATE TRIGGER immutable_generations BEFORE UPDATE OR DELETE ON financial_generations FOR EACH ROW EXECUTE FUNCTION reject_financial_event_mutation();
ALTER TABLE "clerk_webhook_receipts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "clerk_webhook_receipts" FROM anon, authenticated;
ALTER TABLE "firms" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "firms" FROM anon, authenticated;
ALTER TABLE "person_types" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "person_types" FROM anon, authenticated;
ALTER TABLE "employee_types" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "employee_types" FROM anon, authenticated;
ALTER TABLE "legal_areas" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "legal_areas" FROM anon, authenticated;
ALTER TABLE "contract_statuses" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "contract_statuses" FROM anon, authenticated;
ALTER TABLE "assignment_types" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "assignment_types" FROM anon, authenticated;
ALTER TABLE "revenue_types" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "revenue_types" FROM anon, authenticated;
ALTER TABLE "attachment_types" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "attachment_types" FROM anon, authenticated;
ALTER TABLE "financial_analytics" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "financial_analytics" FROM anon, authenticated;
ALTER TABLE "payment_methods" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "payment_methods" FROM anon, authenticated;
ALTER TABLE "title_kinds" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "title_kinds" FROM anon, authenticated;
ALTER TABLE "people" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "people" FROM anon, authenticated;
ALTER TABLE "employee_profiles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "employee_profiles" FROM anon, authenticated;
ALTER TABLE "contracts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "contracts" FROM anon, authenticated;
ALTER TABLE "contract_assignments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "contract_assignments" FROM anon, authenticated;
ALTER TABLE "revenues" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "revenues" FROM anon, authenticated;
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "expenses" FROM anon, authenticated;
ALTER TABLE "financial_generations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "financial_generations" FROM anon, authenticated;
ALTER TABLE "direct_financial_entries" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "direct_financial_entries" FROM anon, authenticated;
ALTER TABLE "receivables" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "receivables" FROM anon, authenticated;
ALTER TABLE "payables" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "payables" FROM anon, authenticated;
ALTER TABLE "receipts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "receipts" FROM anon, authenticated;
ALTER TABLE "receipt_reversals" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "receipt_reversals" FROM anon, authenticated;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "payments" FROM anon, authenticated;
ALTER TABLE "payment_reversals" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "payment_reversals" FROM anon, authenticated;
ALTER TABLE "remuneration_calculations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "remuneration_calculations" FROM anon, authenticated;
ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "attachments" FROM anon, authenticated;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "audit_logs" FROM anon, authenticated;
