## 1. Contract And Spec Updates

- [x] 1.1 Update `docs/implementation/ARCHITECTURE.md` and `docs/implementation/CONVENTIONS.md` to define `rules.ts` as the canonical home for feature-local pure business validation.
- [x] 1.2 Update the affected OpenSpec capabilities so the client refactor and rule naming convention are documented before implementation starts.
- [x] 1.3 Document that exported business-rule entrypoints should use a `validate...` prefix.

## 2. Client Feature Refactor

- [x] 2.1 Create `src/features/clients/rules.ts`.
- [x] 2.2 Move pure client business validation from `utils/validation.ts` into `rules.ts`.
- [x] 2.3 Rename exported client rule entrypoints to follow the `validate...` convention.
- [x] 2.3.1 Keep `validateClientDocumentRules` as the canonical exported validator for the current client validation scope.
- [x] 2.3.2 Introduce `validateClientBusinessRules` only if an aggregate validator is needed without duplicating narrower rule logic.
- [x] 2.3.3 Do not introduce `validateClientTypeRules` unless pure type-only rules emerge that are separate from document validation.
- [x] 2.4 Update `schemas/form.ts`, `api/create.ts`, and `api/update.ts` to import the canonical rules from `rules.ts`.
- [x] 2.5 Keep the client barrel and route-facing surface stable unless a documented contract change is required.

## 3. Rule Placement Boundaries

- [x] 3.1 Keep persisted lookup and state validation in `api/lookups.ts`.
- [x] 3.2 Keep `utils/` limited to normalization, formatting, and default helpers after the move.
- [x] 3.3 Remove `utils/validation.ts` after all imports are updated.

## 4. Behavior Preservation

- [x] 4.1 Preserve client create and update behavior for type-dependent CPF/CNPJ validation, immutable client type, and tenant-scoped uniqueness.
- [x] 4.2 Preserve delete and restore protections tied to active contracts and role permissions.
- [x] 4.3 Preserve route behavior, query keys, overlays, read-query behavior, and existing user-visible pt-BR messages unless a contract update explicitly changes them.

## 5. Verification

- [x] 5.1 Add or update tests around client rule behavior plus create and update flows so the new rule location does not change behavior.
- [x] 5.2 Run the repository verification commands required by the workflow and resolve any issues before marking the change complete.
