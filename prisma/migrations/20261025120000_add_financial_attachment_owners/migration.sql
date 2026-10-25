BEGIN;

ALTER TABLE "attachments"
ADD COLUMN "feeId" INTEGER,
ADD COLUMN "remunerationId" INTEGER;

CREATE INDEX "attachments_feeId_idx" ON "attachments"("feeId");
CREATE INDEX "attachments_remunerationId_idx" ON "attachments"("remunerationId");

ALTER TABLE "attachments"
ADD CONSTRAINT "attachments_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fees"("id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "attachments_remunerationId_fkey" FOREIGN KEY ("remunerationId") REFERENCES "remunerations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "attachments" DROP CONSTRAINT "attachments_exactly_one_owner_check";
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_exactly_one_owner_check" CHECK (
    num_nonnulls("clientId", "employeeId", "contractId", "expenseId", "feeId", "remunerationId") = 1
);

COMMIT;
