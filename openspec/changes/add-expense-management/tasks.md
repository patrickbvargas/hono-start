## 1. Contract and persistence foundation

- [ ] 1.1 Add the new `expense-management` capability delta and update attachment-management to support expense owner context.
- [ ] 1.2 Review the current Prisma schema, lookup strategy, and seed workflow, then add the persistence coverage required for `Expense` and expense-category lookup data.
- [ ] 1.3 Define stable expense-category values and pt-BR labels for the provided business categories.
- [ ] 1.4 Extend attachment persistence and owner-context helpers so one attachment can belong to an expense through the same single-owner rule used by client, employee, and contract.

## 2. Expense feature contract

- [ ] 2.1 Create `src/features/expenses/schemas/model.ts`, `form.ts`, `filter.ts`, `sort.ts`, and `search.ts` following the `clients` reference slice.
- [ ] 2.2 Define the explicit expense route contract in schemas and defaults: `query`, `category`, `dateFrom`, `dateTo`, `active`, `status`, pagination, and sorting with default `expenseDate` descending.
- [ ] 2.3 Add feature-local defaults, normalization helpers, formatting helpers, and safe pt-BR error constants for expense writes and filters.
- [ ] 2.4 Add the public barrel for route-facing expense queries, components, hooks, search schema, and defaults only.

## 3. Server operations and authorization

- [ ] 3.1 Implement expense list and detail server functions with deterministic ordering, URL-driven filtering, tenant scoping, and administrator-only authorization.
- [ ] 3.2 Implement expense create and update server functions with authoritative category resolution, date and amount validation, normalization, audit coverage, and safe error handling.
- [ ] 3.3 Implement administrator-only expense delete and restore server functions aligned with the shared lifecycle pattern.

## 4. Hooks and UI components

- [ ] 4.1 Implement expense data, form, filter, delete, and restore hooks with toast feedback and query invalidation.
- [ ] 4.2 Implement expense list, table, and filter components using the shared entity-management pattern and BRL/date formatting conventions from `honorarios`.
- [ ] 4.3 Keep `Observação` out of the default list surfaces and render it in the form plus a dedicated details-drawer section.
- [ ] 4.4 Implement the expense form modal and details drawer, including the `Anexos` section inside the drawer.

## 5. Attachment integration and route wiring

- [ ] 5.1 Extend the attachments feature to accept `expense` as a supported owner context for list, upload, and delete flows.
- [ ] 5.2 Add the `/despesas` authenticated route using the thin-route pattern with validated search state, loader prefetching, and overlay composition.
- [ ] 5.3 Update shared route config and navigation labels so the new route appears in the product shell.

## 6. Canonical docs update

- [ ] 6.1 Update `docs/domain/DOMAIN_MODEL.md`, `BUSINESS_RULES.md`, `ROLES_AND_PERMISSIONS.md`, and `FEATURE_BEHAVIOR.md` for the new expense entity and route.
- [ ] 6.2 Update `docs/domain/LOOKUP_VALUES.md`, `QUERY_BEHAVIOR.md`, `USER_FLOWS.md`, and `EDGE_CASES.md` for expense categories, filters, flows, and validations.

## 7. Verification

- [ ] 7.1 Add focused Vitest coverage for expense schemas, queries, mutations, hooks, lifecycle actions, and expense attachment access.
- [ ] 7.2 Run `pnpm check`.
- [ ] 7.3 Run `npx tsc --noEmit`.
