## Context

Employees and clients already expose a debounced free-text `query` filter that lives in route search state, renders a header search input, and translates to Prisma `where` clauses inside feature-owned data query modules. Contracts, fees, remunerations, and audit logs still require users to combine structured filters only, even when the most common lookup path is a known process number or person name.

This change is cross-cutting because it touches four independent feature slices plus the shared project query contract. The repository already has the target pattern, so the main design goal is convergence rather than invention.

## Goals / Non-Goals

**Goals:**
- Add `query` to the search contracts of contracts, fees, remunerations, and audit logs.
- Reuse the existing list-filter pattern from employees and clients, including debounced URL sync for text input.
- Keep tenant scoping, role-aware visibility, and deterministic pagination unchanged.
- Add focused tests for search parsing and query translation where behavior changes.

**Non-Goals:**
- No fuzzy search, token ranking, or accent normalization beyond existing database `contains` behavior.
- No changes to list sorting, pagination defaults, or existing structured filters.
- No new shared abstraction for text search across features.

## Decisions

### Keep `query` feature-local instead of extracting shared search helpers
Each feature already owns its own `schemas/filter.ts`, `utils/default.ts`, `hooks/use-filter.ts`, `components/filter`, and `data/queries.ts`. Reusing the same shape locally preserves the documented slice contract and avoids cross-feature coupling for four slightly different query targets.

Alternative considered:
- Extract a shared free-text filter helper. Rejected because the repository contract prefers local convergence first, and the query targets differ by relation depth and authorization context.

### Follow the employees/clients debounce pattern for text input
For contracts, fees, and remunerations, the `query` field will join `DEBOUNCED_FIELDS` so typing updates the URL and server query after the same debounce behavior already used by employees and clients. Audit logs will adopt the same pattern for consistency.

Alternative considered:
- Submit immediately on every keypress. Rejected because the current canonical text-search pattern is debounced and avoids unnecessary list churn.

### Translate free-text search inside feature data boundaries
Each feature will add `query` translation directly inside its Prisma `where` builder:
- contracts: `processNumber` or related `client.fullName`
- fees: related `revenue.contract.processNumber`
- remunerations: related `contractEmployee.contract.processNumber` or `contractEmployee.employee.fullName`
- audit logs: `actorName` or `entityName`

Alternative considered:
- Apply client-side filtering after fetch. Rejected because list behavior is documented as server-driven and URL-driven.

### Update the project query contract alongside code
`docs/domain/QUERY_BEHAVIOR.md` currently documents search behavior for clients but not for these four routes. Because the intended product behavior changes, the canonical contract must be updated in the same change.

## Risks / Trade-offs

- Query on related fields can broaden SQL cost on larger datasets → Keep existing firm and role scope predicates in the same `where` object so the new text match remains tenant-scoped and bounded by existing filters.
- Different feature slices may drift in placeholder text or debounce behavior → Reuse the established employees/clients wording pattern and identical `DEBOUNCED_FIELDS` placement.
- Audit logs currently use checkbox-style filters only → Add `query` without removing current actor/action/entity filters so existing workflows keep working.
