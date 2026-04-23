## 1. Test Infrastructure And Baseline

- [x] 1.1 Review current Vitest, Testing Library, Vite, and TanStack testing patterns, using current official docs as needed before implementing library-specific tests.
- [x] 1.2 Run the existing suite and record the baseline test count and any environment-specific command requirements.
- [x] 1.3 Add or refine shared test helpers only where at least two new test files need the same mock factory or render wrapper.
- [x] 1.4 Confirm no database migrations are required for this test-only change.

## 2. Architecture Guardrails

- [x] 2.1 Add source-scanning tests that prevent routes from importing feature internals, Prisma, or persistence modules directly.
- [x] 2.2 Add source-scanning tests that prevent features and routes from importing vendor UI primitives directly instead of `@/shared/components/ui` or documented shared composites.
- [x] 2.3 Extend feature convention tests to keep failure messages actionable for file path, line, and violated rule.
- [x] 2.4 Add guardrails for shared-to-feature dependency direction and feature-to-feature internal imports, with documented exceptions only.

## 3. Schema, Search, Model, And Utility Coverage

- [x] 3.1 Add or expand search and sort schema tests for clients, employees, contracts, fees, remunerations, dashboard, and audit logs.
- [x] 3.2 Add or expand model schema tests for all principal entity list and detail read contracts used by tables, drawers, and edit defaults.
- [x] 3.3 Add or expand form schema tests for create, update, id, and export request inputs where coverage is missing.
- [x] 3.4 Add utility tests for normalization, defaults, formatting, remuneration export CSV/PDF escaping, and export filename behavior.

## 4. Business Rule And Validation Boundary Coverage

- [x] 4.1 Expand pure rule assertion tests for clients, employees, contracts, fees, and remunerations using safe feature-local pt-BR errors.
- [x] 4.2 Add tests that confirm form schemas stay database-free while persisted lookup activity checks happen at server/data boundaries.
- [x] 4.3 Add lookup-backed write tests for unknown, inactive, and unchanged inactive persisted selections across applicable features.
- [x] 4.4 Add negative tests proving invalid payloads fail before persistence mocks are called.

## 5. Data Access, Lifecycle, And Audit Coverage

- [x] 5.1 Add list query tests that assert tenant scoping, deleted/active filtering, pagination, count alignment, and deterministic orderBy tiebreakers.
- [x] 5.2 Add option query tests for entity options versus lookup options, including active/deleted filtering and label ordering.
- [x] 5.3 Add delete and restore mutation tests for soft-delete behavior, blocked dependent cases, and restore clearing `deletedAt`.
- [x] 5.4 Add create/update/delete/restore audit-log tests for actor, firm, entity, action, description, and change data.
- [x] 5.5 Add transaction tests for multi-step writes including contract assignment/revenue sync and fee/remuneration lifecycle side effects.
- [x] 5.6 Add fee/remuneration tests for generation, recalculation, manual override preservation, delete/restore synchronization, and contract auto-completion.

## 6. Authorization And Server Boundary Coverage

- [x] 6.1 Add server boundary tests or extracted-behavior tests that prove session-derived role, actor, and firm scope are authoritative.
- [x] 6.2 Add tests for administrator-only operations, regular-user allowed operations, regular-user denied operations, and cross-firm denial.
- [x] 6.3 Add safe error mapping tests for expected feature errors, Prisma unique constraint errors, and unknown infrastructure errors.
- [x] 6.4 Confirm server boundary tests do not require trusting client-submitted tenant or authority claims.

## 7. Frontend Hook, Component, And Route Coverage

- [x] 7.1 Add form hook tests for create/update branching, parsed payload submission, edit-default hydration, toast feedback, and cache invalidation.
- [x] 7.2 Add delete and restore hook tests for `handleConfirm(id)`, success callbacks, toast feedback, and query invalidation.
- [x] 7.3 Add filter hook/component tests for URL-driven search updates and reset-to-default behavior.
- [x] 7.4 Add table component tests for loading, empty, error, active, inactive, soft-deleted, and lifecycle action states.
- [x] 7.5 Add route composition tests or source guardrails that verify loaders prefetch route-consumed query options and routes remain declarative.

## 8. Verification

- [x] 8.1 Run `pnpm test` and fix all failures.
- [x] 8.2 Run `pnpm check` and fix all lint/format issues without suppressions.
- [x] 8.3 Run `npx tsc --noEmit` and fix all type errors.
- [x] 8.4 Review whether any discovered behavior changes require updates to `docs/` or OpenSpec specs before archiving.
