
CREATE FUNCTION validate_payable_calculation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."remunerationCalculationId" IS NOT NULL AND NOT EXISTS(SELECT 1 FROM remuneration_calculations c JOIN contract_assignments a ON a.id=c."contractAssignmentId" JOIN employee_profiles e ON e.id=a."employeeProfileId" WHERE c.id=NEW."remunerationCalculationId" AND e."personId"=NEW."beneficiaryId") THEN RAISE EXCEPTION 'Remuneration beneficiary mismatch'; END IF;
 IF NEW."generationId" IS NOT NULL AND NOT EXISTS(SELECT 1 FROM financial_generations g WHERE g.id=NEW."generationId" AND g."expenseId"=NEW."expenseId") THEN RAISE EXCEPTION 'Payable generation origin mismatch'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_payable_calculation BEFORE INSERT OR UPDATE ON payables FOR EACH ROW EXECUTE FUNCTION validate_payable_calculation();
CREATE FUNCTION validate_receivable_generation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF NEW."generationId" IS NOT NULL AND NOT EXISTS(SELECT 1 FROM financial_generations g WHERE g.id=NEW."generationId" AND g."revenueId"=NEW."revenueId") THEN RAISE EXCEPTION 'Receivable generation origin mismatch'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_receivable_generation BEFORE INSERT OR UPDATE ON receivables FOR EACH ROW EXECUTE FUNCTION validate_receivable_generation();
CREATE FUNCTION require_calculation_payable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM payables p WHERE p."remunerationCalculationId"=NEW.id) THEN RAISE EXCEPTION 'Calculation requires payable in same transaction'; END IF; RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER require_calculation_payable AFTER INSERT ON remuneration_calculations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION require_calculation_payable();
CREATE FUNCTION cancel_reversed_remuneration() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 UPDATE payables p SET "cancelledAt"=NEW."createdAt", "cancellationReason"=NEW.reason WHERE p."remunerationCalculationId" IN (SELECT id FROM remuneration_calculations WHERE "receiptId"=NEW."receiptId") AND p."cancelledAt" IS NULL;
 RETURN NEW;
END $$;
CREATE TRIGGER cancel_reversed_remuneration AFTER INSERT ON receipt_reversals FOR EACH ROW EXECUTE FUNCTION cancel_reversed_remuneration();

ALTER TABLE receipts DROP CONSTRAINT receipts_amounts_check;
ALTER TABLE receipts ADD CONSTRAINT receipts_amounts_check CHECK ("principalAbated" > 0 AND discount BETWEEN 0 AND "principalAbated" AND interest >= 0 AND penalty >= 0 AND "effectiveAmount" >= 0 AND "effectiveAmount" = "principalAbated" - discount + interest + penalty AND ((discount=0 AND interest=0 AND penalty=0) OR coalesce(length(trim(reason)),0)>0));

ALTER TABLE payments DROP CONSTRAINT payments_amounts_check;
ALTER TABLE payments ADD CONSTRAINT payments_amounts_check CHECK ("principalAbated" > 0 AND discount BETWEEN 0 AND "principalAbated" AND interest >= 0 AND penalty >= 0 AND "effectiveAmount" >= 0 AND "effectiveAmount" = "principalAbated" - discount + interest + penalty AND ((discount=0 AND interest=0 AND penalty=0) OR coalesce(length(trim(reason)),0)>0));
ALTER TABLE receivables DROP CONSTRAINT receivables_amount_check;
ALTER TABLE receivables ADD CONSTRAINT receivables_amount_check CHECK (amount > 0 AND (("cancelledAt" IS NULL AND "cancellationReason" IS NULL) OR ("cancelledAt" IS NOT NULL AND coalesce(length(trim("cancellationReason")),0)>0)));
ALTER TABLE payables DROP CONSTRAINT payables_amount_check;
ALTER TABLE payables ADD CONSTRAINT payables_amount_check CHECK (amount > 0 AND (("cancelledAt" IS NULL AND "cancellationReason" IS NULL) OR ("cancelledAt" IS NOT NULL AND coalesce(length(trim("cancellationReason")),0)>0)));
