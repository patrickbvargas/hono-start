# Success Criteria

## Product Success

- The system reliably replaces spreadsheet-based legal fee tracking.
- Administrators can trust remuneration outputs without manual recalculation.
- Users can find and operate on core records without ambiguity.
- Financial and operational visibility is role-appropriate and tenant-safe.
- Administrative review of mutations is possible through audit data.

## Behavioral Success

- Core workflows complete without undocumented manual steps.
- Business constraints are enforced consistently at runtime.
- Read-only lifecycle states are respected.
- Delete and restore behavior does not corrupt downstream records.
- Non-admin access remains properly scoped to permitted records and actions.
- Canonical flows, lookup values, and edge-case expectations remain documented and recoverable from the domain layer alone.

## Quality Success

- UI copy is in pt-BR.
- Business logic is deterministic and auditable.
- Tenant isolation is preserved in every workflow.
- The code follows the documented project structure and conventions.
- Reference entity slices continue to converge toward the same implementation shape.

## Rebuild Success

The documentation is successful when a new developer or AI agent can rebuild the project with low drift while preserving:

- business rules
- role model
- domain entities
- core workflows
- architectural structure
- code conventions
- frontend interaction patterns

## Implementation-Contract Success

The implementation contract is successful when a contributor can derive, from docs alone:

- which routes and modules belong to the software core
- which user interactions are canonical for entity management
- which business rules are mandatory
- which coding patterns are mandatory
- which technical choices are fixed and not open for reinterpretation
- which feature slices define the canonical implementation pattern

## Failure Signals

- A contributor must infer core rules from scattered code.
- A contributor can choose alternative stack or folder structure without violating docs.
- Business behavior differs between features because the contract is ambiguous.
- The same feature would be implemented in materially different ways by two agents reading the same docs.
