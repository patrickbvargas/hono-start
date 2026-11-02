## 1. Schema & Data Queries

- [x] 1.1 Update `src/features/contracts/schemas/model.ts` and `src/features/contracts/schemas/form.ts` to include `clientPersonId` and `employeePersonId`.
- [x] 1.2 Update `getSelectableContractClients` and `getSelectableContractEmployees` in `src/features/contracts/data/queries.ts` to query active `ClientProfile` and `EmployeeProfile` joined with `Person`.
- [x] 1.3 Update `getContracts` and `getContractById` in `src/features/contracts/data/queries.ts` to query relations via `customer.person` and `assignments.employeeProfile.person`.

## 2. Data Mutations

- [x] 2.1 Update `createContract`, `updateContract`, and `resolveContractAssignments` in `src/features/contracts/data/mutations.ts` to use `customerId` and `tx.contractAssignment` (`employeeProfileId`).

## 3. UI Components

- [x] 3.1 Update `ContractForm` (`src/features/contracts/components/form/index.tsx`) to support client option labels with document and employee options with role badge.
- [x] 3.2 Update `ContractDetails` (`src/features/contracts/components/details/index.tsx`) and `ContractTeam` (`src/features/contracts/components/workspace/team/index.tsx`) to pass `clientPersonId` and `employeePersonId` to `RelatedRecordLink`.
- [x] 3.3 Verify and ensure `ContractFilter` (`src/features/contracts/components/filter/index.tsx`) works seamlessly with updated options.

## 4. Tests & Verification

- [x] 4.1 Update contract mock data and tests in `src/features/contracts/__tests__/`.
- [x] 4.2 Run `pnpm test src/features/contracts`, `pnpm check`, and `npx tsc --noEmit` to verify all tests pass and types are error-free.
