## Context

The repository already has a strong feature-slice contract and a meaningful amount of executable boundary coverage, but the smallest feature mechanics are still defined partly by docs, partly by tests, and partly by precedent in whichever feature was refactored most recently. The audit showed that the biggest remaining drift is not business behavior; it is the small route-facing and component-facing mechanics around feature barrels, query-consumption hooks, option-hook semantics, and equivalent prop contracts.

The current state is close, but not fully uniform:

- `clients`, `employees`, `contracts`, and `fees` expose a very similar public barrel shape.
- `attachments`, `dashboard`, and `audit-logs` expose different barrel categories, even where the same route-facing concerns exist.
- `hooks/use-data.ts` is the canonical location for query consumption, but option-hook behavior still varies between suspense-first and conditional `useQuery` approaches.
- Overlay and table contracts mostly prefer `EntityId`, but that expectation is stronger in practice than it is in the written contract.

The user goal is to eliminate ambiguity in these micro-patterns so contributors can apply the same mechanics across all features without deciding case by case whether a difference is intentional.

## Goals / Non-Goals

**Goals:**
- Define one explicit public-barrel contract for equivalent feature slices.
- Define one explicit `hooks/use-data.ts` contract for collection reads, single-entity reads, and option reads.
- Define one explicit prop contract for lifecycle/detail overlays and id-driven table actions.
- Update implementation docs so these rules are easy to apply without reverse-engineering tests or reference slices.
- Extend boundary tests so future drift fails automatically.

**Non-Goals:**
- Do not change product behavior, route semantics, permissions, or persistence logic.
- Do not force all features into the same business shape or UI surface.
- Do not replace `get...QueryOptions` factories with custom hook-only data access.
- Do not move server, Prisma, authorization, or business-rule logic into hooks.

## Decisions

### Keep one canonical public barrel shape for equivalent route-facing slices

Equivalent feature slices will expose the same categories of route-facing API from `index.ts`:

- primary route query factory, such as `getClientsQueryOptions`
- top-level route-consumed UI entrypoints
- primary route-consumed collection hook, such as `useClients`
- route search schema or route-consumed model types when needed

They will not export broader query internals, form schemas, or internal hooks by default.

Alternative considered: allow each feature to define its own minimal barrel as long as it works for its route. Rejected because that preserves ambiguity for contributors and makes the public surface depend on feature history rather than one contract.

### Treat `hooks/use-data.ts` as the single feature-local query-consumption boundary

All feature-owned query consumption during render will stay behind `hooks/use-data.ts`. That includes:

- primary route data hooks
- single-entity detail hooks
- option hooks for filters, forms, and feature-owned sections

The hook file remains a consumer facade over `api/queries.ts`, not a second query-definition layer.

Alternative considered: leave direct query calls acceptable as long as they stay out of routes. Rejected because that still fragments data-consumption logic across components and weakens the consistency target.

### Standardize hook semantics by concern, not by feature

Equivalent hook concerns will use equivalent semantics across features:

- collection hooks use `useSuspenseQuery`
- single-entity hooks use `useSuspenseQuery`
- option hooks with multiple unconditional required queries use one `useSuspenseQueries`
- option hooks return normalized named fields rather than raw React Query results

When a hook has mixed required and conditional option data, the design will prefer splitting the concern into separate option hooks or otherwise structuring the hook so the unconditional portion keeps the same suspense-first logic instead of collapsing the whole hook into an ad hoc pattern.

Alternative considered: allow `useQuery` vs `useSuspenseQuery` to vary freely as long as everything stays in `use-data.ts`. Rejected because the user explicitly wants the data-consumption logic itself to be uniform.

### Keep id-driven overlay contracts as the canonical lifecycle pattern

Equivalent detail, delete, restore, and edit overlays will continue using `id: EntityId` and feature-owned hydration rather than row-object snapshots. Equivalent tables will keep callback contracts such as `onView(id)` and `onEdit(id)`.

Alternative considered: permit either id or row-object props based on feature convenience. Rejected because it creates unnecessary variance in route orchestration and weakens reuse of the same overlay composition pattern.

### Update docs and tests together

The implementation docs will be updated in the same change as the boundary tests so the written contract and executable contract stay aligned. The docs will own the rule text; the tests will enforce the most drift-prone parts.

Alternative considered: update tests only and leave docs mostly example-driven. Rejected because the user explicitly wants the rules to be fully covered and easy to apply.

## Risks / Trade-offs

- [Strict normalization exposes more existing drift than expected] → Mitigation: scope the implementation tasks to equivalent micro-patterns only and avoid widening into business-shape refactors.
- [Some current feature hooks will need splitting to preserve uniform semantics] → Mitigation: prefer small hook refactors and explicit naming rather than one oversized compromise hook.
- [Docs become too prescriptive and accidentally outlaw valid feature-specific UI differences] → Mitigation: write the contract in terms of equivalent concerns such as barrels, hooks, and prop mechanics, not domain behavior.
- [Boundary tests overfit the current codebase] → Mitigation: encode behavior-level rules such as export categories and query-consumption placement rather than string-matching one feature blindly.

## Migration Plan

1. Update the OpenSpec delta specs for `entity-foundation` and `feature-data-hooks`.
2. Update implementation docs in `ARCHITECTURE.md`, `CONVENTIONS.md`, `FRONTEND.md`, and `QUALITY_WORKFLOW.md` to describe the normalized micro-patterns explicitly.
3. Normalize feature barrels, `hooks/use-data.ts`, and equivalent prop contracts in the affected slices.
4. Extend feature boundary tests to enforce the updated rules.
5. Run `pnpm check` and `npx tsc --noEmit` after implementation.

Rollback is straightforward because the change does not alter persistence or external APIs. If needed, individual feature slices can temporarily keep their prior hook or barrel shape while the underlying query option factories and routes remain intact.

## Open Questions

- Should every route-facing feature barrel export exactly one primary collection hook, or should screen-oriented features like `dashboard` keep a screen-specific public shape while still following the same export categories?
- For mixed required/conditional option hooks, is the preferred normalization to split the hook into smaller hooks or to keep one hook with a stricter internal pattern?
