-- CreateTable
CREATE TABLE "fees" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "revenueId" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "generatesRemuneration" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remunerations" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "feeId" INTEGER NOT NULL,
    "contractEmployeeId" INTEGER NOT NULL,
    "effectivePercentage" DECIMAL(5,4) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "isSystemGenerated" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "remunerations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fees_firmId_idx" ON "fees"("firmId");

-- CreateIndex
CREATE INDEX "fees_revenueId_idx" ON "fees"("revenueId");

-- CreateIndex
CREATE INDEX "fees_paymentDate_idx" ON "fees"("paymentDate");

-- CreateIndex
CREATE INDEX "fees_deletedAt_idx" ON "fees"("deletedAt");

-- CreateIndex
CREATE INDEX "fees_isActive_idx" ON "fees"("isActive");

-- CreateIndex
CREATE INDEX "fees_createdAt_idx" ON "fees"("createdAt");

-- CreateIndex
CREATE INDEX "remunerations_firmId_idx" ON "remunerations"("firmId");

-- CreateIndex
CREATE INDEX "remunerations_feeId_idx" ON "remunerations"("feeId");

-- CreateIndex
CREATE INDEX "remunerations_contractEmployeeId_idx" ON "remunerations"("contractEmployeeId");

-- CreateIndex
CREATE INDEX "remunerations_paymentDate_idx" ON "remunerations"("paymentDate");

-- CreateIndex
CREATE INDEX "remunerations_deletedAt_idx" ON "remunerations"("deletedAt");

-- CreateIndex
CREATE INDEX "remunerations_isActive_idx" ON "remunerations"("isActive");

-- CreateIndex
CREATE INDEX "remunerations_createdAt_idx" ON "remunerations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "contract_employees_contractId_employeeId_active_key" ON "contract_employees"("contractId", "employeeId") WHERE "deletedAt" IS NULL AND "isActive" = true;

-- CreateIndex
CREATE UNIQUE INDEX "revenues_contractId_typeId_active_key" ON "revenues"("contractId", "typeId") WHERE "deletedAt" IS NULL AND "isActive" = true;

-- CreateIndex
CREATE UNIQUE INDEX "fees_revenueId_installmentNumber_active_key" ON "fees"("revenueId", "installmentNumber") WHERE "deletedAt" IS NULL AND "isActive" = true;

-- CreateIndex
CREATE UNIQUE INDEX "remunerations_feeId_contractEmployeeId_active_key" ON "remunerations"("feeId", "contractEmployeeId") WHERE "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_revenueId_fkey" FOREIGN KEY ("revenueId") REFERENCES "revenues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remunerations" ADD CONSTRAINT "remunerations_contractEmployeeId_fkey" FOREIGN KEY ("contractEmployeeId") REFERENCES "contract_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remunerations" ADD CONSTRAINT "remunerations_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remunerations" ADD CONSTRAINT "remunerations_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
