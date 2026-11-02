## Context

The repository unified entities under `Person` (`ClientProfile`, `EmployeeProfile`, `SupplierProfile`). Legacy `Client` and `Employee` tables were dropped from Prisma.
`src/features/contracts/` must be synchronized with this schema:
- `Contract.customerId` references `ClientProfile.id`
- `ContractAssignment.employeeProfileId` references `EmployeeProfile.id`
- `RelatedRecordLink` maps `client` and `employee` kinds to `/pessoas/$personId` and `PersonDetails`, needing the underlying `Person.id`.

## Goals / Non-Goals

**Goals:**
- Update `getSelectableContractClients` and `getSelectableContractEmployees` to query active `ClientProfile` and `EmployeeProfile` with their related `Person`.
- Format client option labels with formatted CPF/CNPJ (`Nome • Documento`).
- Include `employeeType` label on employee options for role badges.
- Expose `clientPersonId` on Contract Summary/Detail and `employeePersonId` on Contract Assignment so `RelatedRecordLink` points directly to `person.id`.
- Update `createContract` and `updateContract` mutations to persist `customerId` and manage assignments via `tx.contractAssignment` (`employeeProfileId`).
- Update `ContractForm`, `ContractDetails`, `ContractTeam`, and `ContractFilter` components.
- Ensure all vitest contract tests pass.

**Non-Goals:**
- Changing other modules (expenses, fees, remunerations) or alters to database migrations.
- Changing contract revenue or bridge logic.

## Decisions

### 1. Form and Filter Options Keying
Option `value` will be `clientProfile.id` and `employeeProfile.id`.
*Rationale:* Aligns directly with foreign keys stored on `Contract` (`customerId`) and `ContractAssignment` (`employeeProfileId`), preventing secondary lookups during mutation.

### 2. Dual Identification on Contract DTOs
Contract models will provide:
- `clientId: number` (the `clientProfile.id` for form binding and queries)
- `clientPersonId: number` (the `person.id` for `RelatedRecordLink`)
- `employeeId: number` (the `employeeProfile.id` for assignment form binding)
- `employeePersonId: number` (the `person.id` for `RelatedRecordLink`)
*Rationale:* Decouples form selection (keyed on profile FK) from entity navigation (keyed on global Person ID).

### 3. Option Presentation
- Client autocomplete label formatted using `formatCpfCnpj` from `@/shared/lib/formatter` or mask.
- Employee autocomplete option shows `fullName` and employee type.

## Risks / Trade-offs

- **Test mocks**: `src/features/contracts/__tests__/` heavily mocks prisma queries. Mocks will be updated to mock `prisma.clientProfile` and `prisma.employeeProfile` and updated contract relation trees.
- **Backwards compatibility**: Preserving `clientId` and `employeeId` field names on DTOs prevents breakage in existing filters and tables, while adding `clientPersonId` and `employeePersonId` enables correct person-level navigation.

