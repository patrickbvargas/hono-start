## Context

The repository already uses Vitest and Testing Library, and the existing suite passes with coverage concentrated around pure feature rules, form schemas, selected model schemas, session policy, dashboard filtering, feature public barrels, and a small set of architectural conventions. The documented project contract is broader: it requires feature ownership boundaries, route thinness, shared UI import boundaries, server-side validation, tenant-scoped data access, safe error handling, deterministic queries, soft-delete lifecycle behavior, auditability, and consistent form/table/overlay orchestration.

This change expands tests without changing product behavior. The goal is to make the docs contract executable enough that future feature work fails fast when it drifts from the intended architecture or business rules.

## Goals / Non-Goals

**Goals:**

- Add contract guardrail tests that scan source structure and imports for documented architecture boundaries.
- Add feature tests that cover schema, rule, utility, query, mutation, hook, and component behavior according to the canonical slice pattern.
- Add API/data boundary tests for server validation, authorization/session scope, lookup resolution, deterministic ordering, lifecycle state, audit logging, and transactions.
- Use existing test infrastructure and local mocking patterns so the suite remains fast and deterministic.
- Keep tests focused on documented behavior and high-risk boundaries instead of chasing raw coverage percentages.

**Non-Goals:**

- Do not redesign the feature slice pattern, route pattern, or shared UI layer.
- Do not introduce a browser-driven end-to-end test layer in this change.
- Do not require a live PostgreSQL database for the expanded unit and boundary suite.
- Do not add new production dependencies.
- Do not modify runtime behavior solely to make tests easier unless the runtime currently violates the docs contract.

## Decisions

### Decision: Treat docs-backed boundaries as first-class tests

The suite will include source-scanning tests for import boundaries, public barrels, UI vendor isolation, route ownership, braced control flow, feature slice shape, and forbidden direct persistence usage from routes.

Alternative considered: rely on manual review and existing linting. That is weaker because many repository-specific rules are semantic conventions rather than generic lint rules.

### Decision: Prefer focused unit and boundary tests over broad integration tests

Feature rules, schemas, utility functions, data modules, API wrappers, hooks, and components will be tested at their closest useful boundary with mocks for Prisma, server session, React Query, and toasts where needed.

Alternative considered: add database-backed integration tests for all flows immediately. That would increase setup cost and flakiness before the project has a documented test database strategy.

### Decision: Use the `clients` slice as the reference for equivalent feature coverage

The test matrix will compare principal entity features against responsibilities already defined by the reference slice: `api/`, `data/`, `hooks/`, `components/`, `constants/`, `rules/`, `schemas/`, `utils/`, and the top-level public barrel.

Alternative considered: define a separate test layout per feature. That would preserve existing gaps and make cross-feature drift harder to spot.

### Decision: Separate business behavior tests from architecture guardrails

Business behavior tests will live near the feature or shared module under test. Cross-cutting repository guardrails may remain in broader `__tests__` files that scan source paths.

Alternative considered: centralize all new tests in a single top-level test folder. That would make ownership less clear and weaken the feature-slice mental model.

### Decision: Mock persistence while asserting Prisma call shape

Data query and mutation tests will mock Prisma and assert the generated `where`, `orderBy`, transaction, and write call shapes for tenant scope, soft-delete filtering, deterministic tiebreakers, lookup resolution, audit logging, and cascade side effects.

Alternative considered: avoid asserting call shapes because they can be implementation-specific. Here the shape is part of the documented data-access contract, so targeted assertions are appropriate.

## Risks / Trade-offs

- Brittle source-scanning tests → Keep patterns narrow, tied to documented rules, and report actionable file paths.
- Over-mocking persistence behavior → Limit mocks to contract-level call shape and business outcomes rather than every internal line.
- Slow suite growth → Prefer small, isolated tests and avoid live database setup in this change.
- Duplicate assertions across features → Use local helper factories only after repetition is proven; avoid premature shared abstractions.
- Hidden undocumented behavior discovered during implementation → Update the owning docs or OpenSpec artifacts before encoding the behavior as a test.

## Migration Plan

1. Add contract guardrail tests first to protect import and ownership boundaries.
2. Add feature schema/search/model/utility tests where coverage is currently uneven.
3. Add data/API boundary tests for the highest-risk entity lifecycle and authorization paths.
4. Add hook and component tests for form, table, filter, and overlay orchestration.
5. Run `pnpm test`, `pnpm check`, and `npx tsc --noEmit` before completion.

Rollback is straightforward: the change only adds tests and possible test utilities. If an added test is incorrect, remove or refine the test without changing runtime behavior.

## Open Questions

- Should future work add a database-backed integration test layer after a documented test database strategy exists?
- Should source-scanning architecture guardrails eventually move into a custom Biome rule or remain as Vitest tests?
