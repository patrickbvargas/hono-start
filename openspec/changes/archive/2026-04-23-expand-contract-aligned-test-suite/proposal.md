## Why

The current automated test suite is green but narrow: it mainly covers selected schema, rule, mutation, and convention checks. The repository contract in `docs/` defines broader guarantees around architecture boundaries, tenant-safe data access, validation boundaries, lifecycle behavior, auditability, and frontend orchestration that should be protected by tests before the application grows further.

## What Changes

- Expand the Vitest and Testing Library suite to verify the documented project contract across feature, shared, API/data, hook, component, and route boundaries.
- Add contract guardrail tests for import boundaries, shared UI usage, route thinness, public barrels, and forbidden architectural drift.
- Add feature-level tests for search schemas, sort/filter defaults, model schemas, normalization utilities, and business-rule assertions across client, employee, contract, fee, remuneration, dashboard, audit-log, and shared session areas.
- Add data/API boundary tests for tenant scoping, lookup value resolution, deterministic ordering, soft delete/restore behavior, safe error mapping, audit-log creation, and multi-step transaction expectations.
- Add focused hook and component tests for form orchestration, cache invalidation, toast feedback, overlay lifecycle handlers, table state rendering, and URL-driven filters.
- Keep tests aligned with existing stack choices: Vitest, Testing Library, TanStack Query/Form/Router patterns, Prisma mocks, and shadcn/ui through shared UI re-exports only.

## Non-goals

- Do not change product behavior, domain rules, persistence schema, or user-facing flows.
- Do not replace Vitest or Testing Library with another test runner or UI testing framework.
- Do not introduce end-to-end browser automation unless a later change explicitly adds that testing layer.
- Do not use live production-like database dependencies for the unit and boundary suite; persistence behavior should be verified with focused mocks or local test utilities.

## Capabilities

### New Capabilities

- `contract-aligned-test-suite`: Defines the expected automated test coverage for the documented project contract, including architecture guardrails, validation boundaries, data access behavior, authorization/session policy, feature orchestration, and frontend state rendering.

### Modified Capabilities

- None.

## Impact

- Affected code: test files under `src/features/**/__tests__`, `src/shared/**/__tests__`, route or architecture convention tests, and possible shared test utilities.
- Affected docs: no canonical product or implementation docs should change unless test work exposes an undocumented rule or contradiction.
- Affected APIs: no runtime API changes expected.
- Affected dependencies: no new production dependencies expected; test-only utilities should reuse the existing Vitest and Testing Library stack.
- Roles and tenancy: tests should explicitly cover administrator and regular-user authorization, firm-scoped access, and cross-firm denial behavior where applicable.
