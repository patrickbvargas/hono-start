-- Update cancel_reversed_remuneration to use remuneration_payables
CREATE OR REPLACE FUNCTION cancel_reversed_remuneration() RETURNS trigger AS $$
BEGIN
  UPDATE payables p
  SET "cancelledAt" = NEW."createdAt",
      "cancellationReason" = NEW.reason
  WHERE p.id IN (SELECT "payableId" FROM remuneration_payables WHERE "receiptId" = NEW."receiptId")
    AND p."cancelledAt" IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update validate_receipt_reversals to use remuneration_payables
CREATE OR REPLACE FUNCTION validate_receipt_reversals() RETURNS trigger AS $$
DECLARE original_date date;
BEGIN
  SELECT s."effectiveDate" INTO original_date
  FROM receipts s
  JOIN receivables t ON t.id = s."receivableId"
  WHERE s.id = NEW."receiptId"
  FOR UPDATE OF t;

  IF NEW."effectiveDate" < original_date OR NEW."effectiveDate" > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date THEN
    RAISE EXCEPTION 'Invalid reversal date';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM remuneration_payables rp
    JOIN payments x ON x."payableId" = rp."payableId"
    WHERE rp."receiptId" = NEW."receiptId"
      AND NOT EXISTS (SELECT 1 FROM payment_reversals r WHERE r."paymentId" = x.id)
  ) THEN
    RAISE EXCEPTION 'Reverse remuneration payments first';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop obsolete triggers and functions
DROP TRIGGER IF EXISTS validate_receivable_generation ON receivables;
DROP FUNCTION IF EXISTS validate_receivable_generation();

DROP TRIGGER IF EXISTS validate_payable_calculation ON payables;
DROP FUNCTION IF EXISTS validate_payable_calculation();

DROP FUNCTION IF EXISTS validate_generation_titles();

-- Add beneficiary validation for remuneration_payables
CREATE OR REPLACE FUNCTION validate_remuneration_payable() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM payables p
    JOIN contract_assignments a ON a.id = NEW."contractAssignmentId"
    JOIN employee_profiles e ON e.id = a."employeeProfileId"
    JOIN supplier_profiles s ON s.id = p."beneficiaryId"
    WHERE p.id = NEW."payableId"
      AND e."personId" = s."personId"
  ) THEN
    RAISE EXCEPTION 'Remuneration beneficiary mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_remuneration_payable ON remuneration_payables;
CREATE TRIGGER validate_remuneration_payable
BEFORE INSERT OR UPDATE ON remuneration_payables
FOR EACH ROW EXECUTE FUNCTION validate_remuneration_payable();
