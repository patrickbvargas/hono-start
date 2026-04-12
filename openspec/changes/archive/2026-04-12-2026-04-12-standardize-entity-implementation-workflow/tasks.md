## 1. Workflow Spec

- [x] 1.1 Add entity-foundation requirements that define the standard implementation sequence for new entity slices.
- [x] 1.2 Add entity-foundation requirements that define ownership boundaries for feature schemas, feature APIs, feature hooks, feature components, routes, and `shared/`.
- [x] 1.3 Add entity-foundation requirements that define the refactor policy for extracting shared abstractions only after repeated cross-entity usage.

## 2. Reference Guidance

- [x] 2.1 Clarify in the entity-foundation spec that `src/features/employees` is the workflow reference slice, not a copy-paste domain template.
- [x] 2.2 Clarify that new entity routes should compose feature pieces and wire overlays only after the feature contract exists.

## 3. Verification

- [x] 3.1 Review the updated entity-foundation delta to ensure it complements, rather than duplicates, `docs/ARCHITECTURE.md` and `docs/CONVENTIONS.md`.
- [x] 3.2 Confirm this change introduces no application-code work, database migration, or runtime behavior change.
- [x] 3.3 Create `docs/WORKFLOW` to document the workflow.
