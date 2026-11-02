## Why

The system migrated from separate `Client` and `Employee` models to the unified `Person` entity and profile architecture (`ClientProfile` and `EmployeeProfile`). The contracts module (`src/features/contracts`) still referenced obsolete Prisma queries (`prisma.client`, `prisma.employee`, `tx.contractEmployee`, `Contract.clientId` vs `Contract.customerId`), preventing real runtime execution and causing inconsistencies when linking to people records.

Furthermore, contract forms and details require rich presentation:
- Client selection should display formatted document (CPF/CNPJ) alongside the name.
- Collaborator selection should display professional role/type (e.g. Advogado, Assistente) alongside the name.
- Details and workspace links (`RelatedRecordLink`) must point to the underlying `Person.id` so that opening related records routes to `/pessoas/$personId` and `PersonDetails`.

## What Changes

- **Contracts Data Queries (`src/features/contracts/data/queries.ts`)**:
  - `getSelectableContractClients`: Query `ClientProfile` joined with active, non-deleted `Person`, formatting label as `${person.fullName} • ${formattedDocument}` (or fallback to name if no document). Option value is `clientProfile.id`.
  - `getSelectableContractEmployees`: Query `EmployeeProfile` joined with active, non-deleted `Person` and `EmployeeType`, formatting label with employee type. Option value is `employeeProfile.id`.
  - `getContracts` and `getContractById`: Query `customer` relation (`ClientProfile -> Person`) and `assignments` relation (`ContractAssignment -> EmployeeProfile -> Person, EmployeeType`). Expose both profile IDs (`customerId`, `employeeProfileId`) and person IDs (`clientPersonId`, `employeePersonId`).
- **Contracts Data Mutations (`src/features/contracts/data/mutations.ts`)**:
  - `createContract` / `updateContract`: Validate `ClientProfile` and `EmployeeProfile`, save `customerId` on `Contract`, and manage assignments via `tx.contractAssignment` using `employeeProfileId`.
- **Contracts Schemas (`src/features/contracts/schemas/`)**:
  - Update `contractSummarySchema`, `contractDetailSchema`, `contractAssignmentSchema`, and form schemas to include `clientPersonId`, `employeePersonId`, and proper validations.
- **Contracts UI Components**:
  - `ContractForm`: Autocomplete options for client and employee show document and role badge.
  - `ContractDetails` & `ContractTeam`: Ensure `RelatedRecordLink kind="client"` and `RelatedRecordLink kind="employee"` receive `personId`.
  - `ContractFilter`: Uses updated selectable client and employee query options.
- **Tests**:
  - Update contracts test suite (`queries.test.ts`, `mutations.test.ts`, etc.) to match the new profile schema and mocks.

## Capabilities

### Modified Capabilities
- `contract-management`: Synchronize contract CRUD, options queries, form selections, and detail links with unified Person and profile models.

## Impact

- `src/features/contracts/schemas/model.ts`
- `src/features/contracts/schemas/form.ts`
- `src/features/contracts/data/queries.ts`
- `src/features/contracts/data/mutations.ts`
- `src/features/contracts/components/form/index.tsx`
- `src/features/contracts/components/details/index.tsx`
- `src/features/contracts/components/workspace/team/index.tsx`
- `src/features/contracts/__tests__/`

