## 1. Shared Lookup Field Contract

- [x] 1.1 Update `src/shared/types/field.ts` and shared lookup option schemas so lookup-backed `FieldOption` instances use `value` as the selected key instead of `id`.
- [x] 1.2 Update shared autocomplete/listbox form components to bind lookup-backed selections by `value` while preserving disabled inactive options.

## 2. Employee Client Contracts

- [x] 2.1 Change employee form schemas and default values so `type` and `role` use lookup value strings instead of numeric ids.
- [x] 2.2 Change employee filter/search schemas so lookup-backed URL state uses value strings and remove duplicated id-normalization schemas where no longer needed.
- [x] 2.3 Simplify employee form UI and business-rule helpers so lawyer/admin semantics compare stable lookup values directly instead of searching option arrays by id.

## 3. Server Resolution

- [x] 3.1 Update employee create and update server handlers to resolve submitted lookup values to relational ids before Prisma writes.
- [x] 3.2 Update employee list filtering to resolve lookup value filters to relational ids before building Prisma `where` clauses.
- [x] 3.3 Review error handling for unknown lookup values and return user-friendly Portuguese failures.

## 4. Specs And Docs

- [x] 4.1 Update shared and employee OpenSpec specs to define lookup-backed client contracts as value-based.
- [x] 4.2 Update `docs/CONVENTIONS.md`, `docs/PRD.md`, and `docs/DATA_MODEL.md` so lookup-backed URL and form state use lookup `value` while relational persistence remains id-based.

## 5. Verification

- [x] 5.1 Verify employee create/edit flows still preserve inactive lookup options as disabled values under the new field contract.
- [x] 5.2 Verify employee list filter URLs use lookup values and still hydrate the same UI state after refresh.
- [x] 5.3 Run `pnpm check`.
- [x] 5.4 Run `npx tsc --noEmit`.
