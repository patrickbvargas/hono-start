-- CreateTable
CREATE TABLE "attachment_types" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "attachment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "clientId" INTEGER,
    "employeeId" INTEGER,
    "contractId" INTEGER,
    "typeId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "attachments_exactly_one_owner_check" CHECK (
        (CASE WHEN "clientId" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "employeeId" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "contractId" IS NULL THEN 0 ELSE 1 END) = 1
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "attachment_types_value_key" ON "attachment_types"("value");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_storagePath_key" ON "attachments"("storagePath");

-- CreateIndex
CREATE INDEX "attachments_firmId_idx" ON "attachments"("firmId");

-- CreateIndex
CREATE INDEX "attachments_clientId_idx" ON "attachments"("clientId");

-- CreateIndex
CREATE INDEX "attachments_employeeId_idx" ON "attachments"("employeeId");

-- CreateIndex
CREATE INDEX "attachments_contractId_idx" ON "attachments"("contractId");

-- CreateIndex
CREATE INDEX "attachments_typeId_idx" ON "attachments"("typeId");

-- CreateIndex
CREATE INDEX "attachments_deletedAt_idx" ON "attachments"("deletedAt");

-- CreateIndex
CREATE INDEX "attachments_isActive_idx" ON "attachments"("isActive");

-- CreateIndex
CREATE INDEX "attachments_createdAt_idx" ON "attachments"("createdAt");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "attachment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
