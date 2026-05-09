## 1. Shared Contract And List Infrastructure

- [x] 1.1 Confirm which principal list routes currently render the entity id as the first visible column and exclude any route that does not meet that contract.
- [x] 1.2 Update shared list/table infrastructure so the first-column `ID` header can participate in the existing sortable-header behavior while the row value still opens details.
- [x] 1.3 Update any shared search or sort helper types that restrict allowed sortable fields so `id` can flow through the canonical route-driven list pattern.

## 2. Feature Route State And Server Ordering

- [x] 2.1 Update clients and employees route search schemas, sortable-column definitions, and server-side order builders to accept `id` sorting without changing default sorts.
- [x] 2.2 Update contracts and fees route search schemas, sortable-column definitions, and server-side order builders to accept `id` sorting without changing default sorts.
- [x] 2.3 Update remunerations and any included audit-log route search schemas, sortable-column definitions, and server-side order builders to accept `id` sorting without changing default sorts.

## 3. Table Rendering

- [x] 3.1 Update each affected feature table so the first column renders an `ID` header with sortable state and keeps the row id value as the clickable details entrypoint.
- [x] 3.2 Verify loading, empty, and populated list states still align visually after the new first-column header behavior is added.

## 4. Verification

- [ ] 4.1 Add or update feature-local tests covering search-schema parsing, allowed sort-field validation, and deterministic query ordering for `id`.
- [ ] 4.2 Add or update component tests for affected tables to verify the `ID` header exposes sortable state without removing the details action from the row value.
- [x] 4.3 Run `pnpm check` and `npx tsc --noEmit`, fix any resulting issues, and confirm no DB migration is required for this change.
