-- Preserve current Person identities; profiles get an explicit initial ID map.
CREATE TABLE client_profiles (
 id SERIAL PRIMARY KEY, "personId" INTEGER NOT NULL UNIQUE REFERENCES people(id) ON DELETE RESTRICT ON UPDATE CASCADE,
 "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE supplier_profiles (
 id SERIAL PRIMARY KEY, "personId" INTEGER NOT NULL UNIQUE REFERENCES people(id) ON DELETE RESTRICT ON UPDATE CASCADE,
 "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO client_profiles(id,"personId") SELECT p.id,p.id FROM people p WHERE p."isCustomer" OR EXISTS(SELECT 1 FROM contracts c WHERE c."customerId"=p.id) OR EXISTS(SELECT 1 FROM receivables r WHERE r."debtorId"=p.id);
INSERT INTO supplier_profiles(id,"personId") SELECT p.id,p.id FROM people p WHERE p."isSupplier" OR EXISTS(SELECT 1 FROM employee_profiles e WHERE e."personId"=p.id) OR EXISTS(SELECT 1 FROM expenses e WHERE e."supplierId"=p.id) OR EXISTS(SELECT 1 FROM payables t WHERE t."beneficiaryId"=p.id);
SELECT setval(pg_get_serial_sequence('client_profiles','id'),COALESCE((SELECT max(id) FROM client_profiles),1), EXISTS(SELECT 1 FROM client_profiles));
SELECT setval(pg_get_serial_sequence('supplier_profiles','id'),COALESCE((SELECT max(id) FROM supplier_profiles),1), EXISTS(SELECT 1 FROM supplier_profiles));
ALTER TABLE contracts DROP CONSTRAINT "contracts_customerId_fkey", ADD CONSTRAINT "contracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES client_profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE receivables DROP CONSTRAINT "receivables_debtorId_fkey", ADD CONSTRAINT "receivables_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES client_profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE expenses DROP CONSTRAINT "expenses_supplierId_fkey", ADD CONSTRAINT "expenses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES supplier_profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE payables DROP CONSTRAINT "payables_beneficiaryId_fkey", ADD CONSTRAINT "payables_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES supplier_profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE people DROP CONSTRAINT people_document_check;
ALTER TABLE people ALTER COLUMN document DROP NOT NULL, ALTER COLUMN "personTypeId" DROP NOT NULL;
ALTER TABLE people ADD COLUMN "isGeneric" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "seedKey" TEXT;
CREATE UNIQUE INDEX "people_seedKey_key" ON people("seedKey");
ALTER TABLE people DROP COLUMN "isCustomer", DROP COLUMN "isSupplier", DROP COLUMN "isEmployee";
ALTER TABLE people ADD CONSTRAINT people_document_check CHECK (
 ("isGeneric" AND document IS NULL AND "personTypeId" IS NULL) OR
 (NOT "isGeneric" AND document ~ '^([0-9]{11}|[0-9]{14})$' AND document IS NOT NULL AND "personTypeId" IS NOT NULL)
);
CREATE OR REPLACE FUNCTION validate_payable_calculation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."remunerationCalculationId" IS NOT NULL AND NOT EXISTS(SELECT 1 FROM remuneration_calculations c JOIN contract_assignments a ON a.id=c."contractAssignmentId" JOIN employee_profiles e ON e.id=a."employeeProfileId" JOIN supplier_profiles s ON s.id=NEW."beneficiaryId" WHERE c.id=NEW."remunerationCalculationId" AND e."personId"=s."personId") THEN RAISE EXCEPTION 'Remuneration beneficiary mismatch'; END IF;
 IF NEW."generationId" IS NOT NULL AND NOT EXISTS(SELECT 1 FROM financial_generations g WHERE g.id=NEW."generationId" AND g."expenseId"=NEW."expenseId") THEN RAISE EXCEPTION 'Payable generation origin mismatch'; END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION validate_person_profiles() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM employee_profiles e JOIN people p ON p.id=e."personId" WHERE p."isGeneric") THEN RAISE EXCEPTION 'Generic Person cannot be employee'; END IF;
 IF EXISTS(SELECT 1 FROM employee_profiles e WHERE e."isActive" AND e."deletedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM supplier_profiles s WHERE s."personId"=e."personId" AND s."isActive")) THEN RAISE EXCEPTION 'Active employee requires supplier profile'; END IF;
 IF EXISTS(SELECT 1 FROM supplier_profiles s JOIN payables t ON t."beneficiaryId"=s.id WHERE NOT s."isActive" AND t."cancelledAt" IS NULL AND t.amount > COALESCE((SELECT sum(p."principalAbated") FROM payments p WHERE p."payableId"=t.id AND NOT EXISTS(SELECT 1 FROM payment_reversals r WHERE r."paymentId"=p.id)),0)) THEN RAISE EXCEPTION 'Supplier has outstanding obligations'; END IF;
 IF EXISTS(SELECT 1 FROM client_profiles s JOIN receivables t ON t."debtorId"=s.id WHERE NOT s."isActive" AND t."cancelledAt" IS NULL AND t.amount > COALESCE((SELECT sum(p."principalAbated") FROM receipts p WHERE p."receivableId"=t.id AND NOT EXISTS(SELECT 1 FROM receipt_reversals r WHERE r."receiptId"=p.id)),0)) THEN RAISE EXCEPTION 'Client has outstanding obligations'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER validate_employee_role AFTER INSERT OR UPDATE OR DELETE ON employee_profiles DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_person_profiles();
CREATE CONSTRAINT TRIGGER validate_supplier_role AFTER INSERT OR UPDATE OR DELETE ON supplier_profiles DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_person_profiles();
CREATE CONSTRAINT TRIGGER validate_client_role AFTER INSERT OR UPDATE OR DELETE ON client_profiles DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_person_profiles();
CREATE CONSTRAINT TRIGGER validate_person_role AFTER INSERT OR UPDATE ON people DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_person_profiles();
CREATE FUNCTION require_active_counterparty_profile() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid INTEGER; eligible BOOLEAN;
BEGIN
 IF TG_TABLE_NAME='contracts' THEN pid:=NEW."customerId";
 ELSIF TG_TABLE_NAME='receivables' THEN pid:=NEW."debtorId";
 ELSIF TG_TABLE_NAME='expenses' THEN pid:=NEW."supplierId";
 ELSE pid:=NEW."beneficiaryId"; END IF;
 IF TG_OP='UPDATE' THEN
  IF TG_TABLE_NAME='contracts' AND NEW."customerId"=OLD."customerId" THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME='receivables' AND NEW."debtorId"=OLD."debtorId" THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME='expenses' AND NEW."supplierId"=OLD."supplierId" THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME='payables' AND NEW."beneficiaryId"=OLD."beneficiaryId" THEN RETURN NEW; END IF;
 END IF;
 IF TG_TABLE_NAME IN ('contracts','receivables') THEN
 SELECT s."isActive" AND p."isActive" AND p."deletedAt" IS NULL INTO eligible FROM client_profiles s JOIN people p ON p.id=s."personId" WHERE s.id=pid;
 ELSE
 SELECT s."isActive" AND p."isActive" AND p."deletedAt" IS NULL INTO eligible FROM supplier_profiles s JOIN people p ON p.id=s."personId" WHERE s.id=pid;
 END IF;
 IF eligible IS NOT TRUE THEN RAISE EXCEPTION 'Active counterparty profile required'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER active_contract_customer BEFORE INSERT OR UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION require_active_counterparty_profile();
CREATE TRIGGER active_receivable_debtor BEFORE INSERT OR UPDATE ON receivables FOR EACH ROW EXECUTE FUNCTION require_active_counterparty_profile();
CREATE TRIGGER active_expense_supplier BEFORE INSERT OR UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION require_active_counterparty_profile();
CREATE TRIGGER active_payable_beneficiary BEFORE INSERT OR UPDATE ON payables FOR EACH ROW EXECUTE FUNCTION require_active_counterparty_profile();
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON client_profiles,supplier_profiles FROM anon,authenticated;
