ALTER TABLE "attachments"
DROP CONSTRAINT "attachments_exactly_one_owner_check";

ALTER TABLE "attachments"
ADD CONSTRAINT "attachments_exactly_one_owner_check" CHECK (
    (CASE WHEN "clientId" IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN "employeeId" IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN "contractId" IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN "expenseId" IS NULL THEN 0 ELSE 1 END) = 1
);
