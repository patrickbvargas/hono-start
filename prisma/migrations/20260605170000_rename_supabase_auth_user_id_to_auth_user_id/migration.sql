-- RenameColumn
ALTER TABLE "employees"
RENAME COLUMN "supabaseAuthUserId" TO "authUserId";

-- RenameIndex
ALTER INDEX "employees_supabaseAuthUserId_key"
RENAME TO "employees_authUserId_key";
