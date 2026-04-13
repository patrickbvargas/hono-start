-- CreateTable
CREATE TABLE "firms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_types" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "client_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_types" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "employee_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_areas" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "legal_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_statuses" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contract_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_types" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "assignment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_types" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "revenue_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "oabNumber" TEXT,
    "remunerationPercentage" DECIMAL(5,4) NOT NULL,
    "referralPercentage" DECIMAL(5,4) NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "legalAreaId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "processNumber" TEXT NOT NULL,
    "feePercentage" DECIMAL(5,4) NOT NULL,
    "notes" TEXT,
    "allowStatusChange" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_employees" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "assignmentTypeId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contract_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenues" (
    "id" SERIAL NOT NULL,
    "firmId" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "totalValue" DECIMAL(14,2) NOT NULL,
    "downPaymentValue" DECIMAL(14,2),
    "paymentStartDate" TIMESTAMP(3) NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_types_value_key" ON "client_types"("value");

-- CreateIndex
CREATE UNIQUE INDEX "employee_types_value_key" ON "employee_types"("value");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_value_key" ON "user_roles"("value");

-- CreateIndex
CREATE UNIQUE INDEX "legal_areas_value_key" ON "legal_areas"("value");

-- CreateIndex
CREATE UNIQUE INDEX "contract_statuses_value_key" ON "contract_statuses"("value");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_types_value_key" ON "assignment_types"("value");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_types_value_key" ON "revenue_types"("value");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_firmId_idx" ON "employees"("firmId");

-- CreateIndex
CREATE INDEX "employees_deletedAt_idx" ON "employees"("deletedAt");

-- CreateIndex
CREATE INDEX "employees_isActive_idx" ON "employees"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "employees_firmId_oabNumber_key" ON "employees"("firmId", "oabNumber");

-- CreateIndex
CREATE INDEX "clients_firmId_idx" ON "clients"("firmId");

-- CreateIndex
CREATE INDEX "clients_deletedAt_idx" ON "clients"("deletedAt");

-- CreateIndex
CREATE INDEX "clients_isActive_idx" ON "clients"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "clients_firmId_document_key" ON "clients"("firmId", "document");

-- CreateIndex
CREATE INDEX "contracts_firmId_idx" ON "contracts"("firmId");

-- CreateIndex
CREATE INDEX "contracts_clientId_idx" ON "contracts"("clientId");

-- CreateIndex
CREATE INDEX "contracts_legalAreaId_idx" ON "contracts"("legalAreaId");

-- CreateIndex
CREATE INDEX "contracts_statusId_idx" ON "contracts"("statusId");

-- CreateIndex
CREATE INDEX "contracts_deletedAt_idx" ON "contracts"("deletedAt");

-- CreateIndex
CREATE INDEX "contracts_isActive_idx" ON "contracts"("isActive");

-- CreateIndex
CREATE INDEX "contracts_createdAt_idx" ON "contracts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_firmId_processNumber_key" ON "contracts"("firmId", "processNumber");

-- CreateIndex
CREATE INDEX "contract_employees_firmId_idx" ON "contract_employees"("firmId");

-- CreateIndex
CREATE INDEX "contract_employees_contractId_idx" ON "contract_employees"("contractId");

-- CreateIndex
CREATE INDEX "contract_employees_employeeId_idx" ON "contract_employees"("employeeId");

-- CreateIndex
CREATE INDEX "contract_employees_assignmentTypeId_idx" ON "contract_employees"("assignmentTypeId");

-- CreateIndex
CREATE INDEX "contract_employees_deletedAt_idx" ON "contract_employees"("deletedAt");

-- CreateIndex
CREATE INDEX "contract_employees_isActive_idx" ON "contract_employees"("isActive");

-- CreateIndex
CREATE INDEX "contract_employees_createdAt_idx" ON "contract_employees"("createdAt");

-- CreateIndex
CREATE INDEX "revenues_firmId_idx" ON "revenues"("firmId");

-- CreateIndex
CREATE INDEX "revenues_contractId_idx" ON "revenues"("contractId");

-- CreateIndex
CREATE INDEX "revenues_typeId_idx" ON "revenues"("typeId");

-- CreateIndex
CREATE INDEX "revenues_deletedAt_idx" ON "revenues"("deletedAt");

-- CreateIndex
CREATE INDEX "revenues_isActive_idx" ON "revenues"("isActive");

-- CreateIndex
CREATE INDEX "revenues_createdAt_idx" ON "revenues"("createdAt");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "employee_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "client_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_legalAreaId_fkey" FOREIGN KEY ("legalAreaId") REFERENCES "legal_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "contract_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_employees" ADD CONSTRAINT "contract_employees_assignmentTypeId_fkey" FOREIGN KEY ("assignmentTypeId") REFERENCES "assignment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_employees" ADD CONSTRAINT "contract_employees_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_employees" ADD CONSTRAINT "contract_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_employees" ADD CONSTRAINT "contract_employees_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "revenue_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
