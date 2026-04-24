## shadcn/ui Project Guidance

This project uses shadcn/ui through the shared UI layer.

- Import reusable UI only from `@/shared/components/ui` in routes and features.
- Do not import shadcn, Radix, Base UI, or other vendor UI primitives directly from routes or features.
- Shared UI generated components and local shared composites live under `src/shared/components/ui`.
- `src/shared/components/Hui` is a temporary migration compatibility layer only; do not add new imports from it.
- Before shadcn/ui-specific work, read the relevant project docs in `docs/implementation/` and prefer the existing shared UI export shape.

## Project Implementation Contract

This repository uses `docs/` as the canonical project contract.

Read in this order before making substantial changes:

1. `docs/index.md`
2. `docs/domain/PRODUCT_SENSE.md`
3. `docs/domain/DOMAIN_MODEL.md`
4. `docs/domain/BUSINESS_RULES.md`
5. `docs/domain/ROLES_AND_PERMISSIONS.md`
6. `docs/domain/FEATURE_BEHAVIOR.md`
7. `docs/domain/LOOKUP_VALUES.md`
8. `docs/domain/QUERY_BEHAVIOR.md`
9. `docs/domain/USER_FLOWS.md`
10. `docs/domain/EDGE_CASES.md`
11. `docs/domain/SUCCESS_CRITERIA.md`
12. `docs/implementation/ARCHITECTURE.md`
13. `docs/implementation/DATA_ACCESS.md`
14. `docs/implementation/CONVENTIONS.md`
15. `docs/implementation/FRONTEND.md`
16. `docs/implementation/SECURITY.md`
17. `docs/implementation/QUALITY_WORKFLOW.md`

### Contract Rules

- Domain docs define business truth and expected behavior.
- Implementation docs define stack, structure, naming, and coding rules for this repository.
- If code disagrees with docs, docs describe intended truth.
- If a pattern is undocumented, preserve the existing documented project shape instead of inventing a new one.
- Contributors must not swap the documented stack, folder structure, hook patterns, or import boundaries without updating the contract first.
