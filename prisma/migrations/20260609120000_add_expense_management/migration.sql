CREATE TABLE "expense_categories" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "attachments" ADD COLUMN "expenseId" INTEGER;

CREATE UNIQUE INDEX "expense_categories_value_key" ON "expense_categories"("value");
CREATE INDEX "expenses_firmId_idx" ON "expenses"("firmId");
CREATE INDEX "expenses_categoryId_idx" ON "expenses"("categoryId");
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");
CREATE INDEX "expenses_deletedAt_idx" ON "expenses"("deletedAt");
CREATE INDEX "expenses_isActive_idx" ON "expenses"("isActive");
CREATE INDEX "expenses_createdAt_idx" ON "expenses"("createdAt");
CREATE INDEX "attachments_expenseId_idx" ON "attachments"("expenseId");

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
