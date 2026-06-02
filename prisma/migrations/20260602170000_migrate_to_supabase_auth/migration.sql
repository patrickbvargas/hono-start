-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "isAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supabaseAuthUserId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "employees_supabaseAuthUserId_key" ON "employees"("supabaseAuthUserId");
