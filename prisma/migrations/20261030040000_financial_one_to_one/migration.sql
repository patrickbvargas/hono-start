-- CreateIndex
CREATE UNIQUE INDEX "financial_generations_firmId_revenueId_key" ON "financial_generations"("firmId", "revenueId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_generations_firmId_expenseId_key" ON "financial_generations"("firmId", "expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "payables_firmId_remunerationCalculationId_key" ON "payables"("firmId", "remunerationCalculationId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reversals_firmId_paymentId_key" ON "payment_reversals"("firmId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_reversals_firmId_receiptId_key" ON "receipt_reversals"("firmId", "receiptId");
