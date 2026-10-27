BEGIN;
LOCK TABLE clients, employees, attachments, audit_logs IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM client_profiles p WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c."profileId"=p.id)) OR EXISTS (SELECT 1 FROM employee_profiles p WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e."profileId"=p.id)) THEN
  RAISE EXCEPTION 'Perfis sem cadastro correspondente: reconcilie os dados antes da migração global.';
 END IF;
 IF EXISTS (SELECT 1 FROM clients GROUP BY "profileId" HAVING count(*) > 1) OR EXISTS (SELECT 1 FROM employees GROUP BY "profileId" HAVING count(*) > 1) THEN
  RAISE EXCEPTION 'Cadastros com vínculos duplicados: reconcilie os IDs existentes antes da migração global. Nenhum dado foi alterado.';
 END IF;
END $$;
ALTER TABLE attachments DROP CONSTRAINT attachments_exactly_one_owner_check;
ALTER TABLE clients ADD COLUMN "fullName" TEXT, ADD COLUMN document TEXT, ADD COLUMN email TEXT, ADD COLUMN phone TEXT, ADD COLUMN "typeId" INTEGER;
ALTER TABLE employees ADD COLUMN "fullName" TEXT, ADD COLUMN "oabNumber" TEXT;
ALTER TABLE attachments ADD COLUMN "clientId" INTEGER, ADD COLUMN "employeeId" INTEGER;
ALTER TABLE audit_logs ADD COLUMN "clientId" INTEGER, ADD COLUMN "employeeId" INTEGER;
UPDATE clients c SET "fullName"=p."fullName", document=p.document, email=p.email, phone=p.phone, "typeId"=p."typeId" FROM client_profiles p WHERE p.id=c."profileId";
UPDATE employees e SET "fullName"=p."fullName", "oabNumber"=p."oabNumber" FROM employee_profiles p WHERE p.id=e."profileId";
UPDATE attachments a SET "clientId"=c.id FROM clients c WHERE c."profileId"=a."clientProfileId";
UPDATE attachments a SET "employeeId"=e.id FROM employees e WHERE e."profileId"=a."employeeProfileId";
UPDATE audit_logs a SET "clientId"=c.id FROM clients c WHERE c."profileId"=a."clientProfileId" OR (a."entityType"='Client' AND a."entityId"=c.id::text);
UPDATE audit_logs a SET "employeeId"=e.id FROM employees e WHERE e."profileId"=a."employeeProfileId" OR (a."entityType"='Employee' AND a."entityId"=e.id::text);
UPDATE audit_logs a SET "clientId"=f."clientId", "employeeId"=f."employeeId" FROM attachments f WHERE a."entityType"='Attachment' AND a."entityId"=f.id::text;
UPDATE audit_logs SET "entityType"='Client', "entityId"="clientId"::text WHERE "entityType"='ClientProfile' AND "clientId" IS NOT NULL;
UPDATE audit_logs SET "entityType"='Employee', "entityId"="employeeId"::text WHERE "entityType"='EmployeeProfile' AND "employeeId" IS NOT NULL;
ALTER TABLE clients ALTER COLUMN "fullName" SET NOT NULL, ALTER COLUMN document SET NOT NULL, ALTER COLUMN "typeId" SET NOT NULL;
ALTER TABLE employees ALTER COLUMN "fullName" SET NOT NULL;
-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_profileId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_firmId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_employeeProfileId_fkey";

-- DropForeignKey
ALTER TABLE "client_profiles" DROP CONSTRAINT "client_profiles_typeId_fkey";

-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_firmId_fkey";

-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_profileId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_employeeProfileId_fkey";

-- DropIndex
DROP INDEX "employees_firmId_idx";

-- DropIndex
DROP INDEX "employees_firmId_profileId_key";

-- DropIndex
DROP INDEX "audit_logs_clientProfileId_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_employeeProfileId_createdAt_idx";

-- DropIndex
DROP INDEX "clients_firmId_idx";

-- DropIndex
DROP INDEX "clients_firmId_profileId_key";

-- DropIndex
DROP INDEX "attachments_clientProfileId_idx";

-- DropIndex
DROP INDEX "attachments_employeeProfileId_idx";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "firmId",
DROP COLUMN "profileId";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "clientProfileId",
DROP COLUMN "employeeProfileId";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "firmId",
DROP COLUMN "profileId";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "clientProfileId",
DROP COLUMN "employeeProfileId";

-- DropTable
DROP TABLE "client_profiles";

-- DropTable
DROP TABLE "employee_profiles";

-- CreateIndex
CREATE UNIQUE INDEX "employees_oabNumber_key" ON "employees"("oabNumber");

-- CreateIndex
CREATE INDEX "audit_logs_clientId_createdAt_idx" ON "audit_logs"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_employeeId_createdAt_idx" ON "audit_logs"("employeeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_document_key" ON "clients"("document");

-- CreateIndex
CREATE INDEX "attachments_clientId_idx" ON "attachments"("clientId");

-- CreateIndex
CREATE INDEX "attachments_employeeId_idx" ON "attachments"("employeeId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "client_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE attachments ADD CONSTRAINT attachments_exactly_one_owner_check CHECK (
 num_nonnulls("clientId", "employeeId", "contractId", "expenseId", "feeId", "remunerationId") = 1
);
COMMIT;
