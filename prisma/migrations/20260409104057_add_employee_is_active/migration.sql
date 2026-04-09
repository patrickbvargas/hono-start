-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "employees_isActive_idx" ON "employees"("isActive");
