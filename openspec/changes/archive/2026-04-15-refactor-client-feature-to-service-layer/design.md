## Context

The repository currently keeps feature internals in `api`, `schemas`, `utils`, `hooks`, `components`, and `constants`. That structure is still acceptable for now, but pure business validation inside a feature needs one more explicit home so maintainers do not have to guess between `schemas/form.ts`, `utils/validation.ts`, and API write handlers.

The `clients` feature is the first candidate for this smaller pattern because it already contains repeated CPF/CNPJ and type-dependent document validation reused by both schema refinements and write handlers.

## Goals / Non-Goals

**Goals:**
- Make one feature-local file the first place a maintainer reads to understand pure client business validation.
- Keep pure client rules in `rules.ts`, not in `utils/validation.ts`.
- Standardize authoritative rule entrypoints on a `validate...` prefix.
- Keep schema refinements and API write handlers reusing the same canonical rule functions.
- Use the refactored client slice as the reference pattern for future feature validation cleanup.

**Non-Goals:**
- Changing user-visible client behavior.
- Introducing `services/`, `domain/`, or a separate `data/` layer.
- Rewriting route composition, UI structure, or read-query parsing behavior.
- Moving persisted lookup checks out of `api/lookups.ts`.

## Target Slice Shape

```text
src/features/clients/
  api/
    create.ts
    update.ts
    delete.ts
    restore.ts
    get.ts
    lookups.ts
  schemas/
    form.ts
    filter.ts
    search.ts
    sort.ts
    model.ts
  rules.ts
  hooks/
  components/
  constants/
  utils/
  index.ts
```

## Decisions

### D1. `rules.ts` owns pure client rules

Pure client rules move from `utils/validation.ts` into `rules.ts`. This includes:

- document-required logic
- CPF/CNPJ validity based on type
- client-type semantic validation where no persisted lookup state is required

### D2. `validate...` is the canonical rule-entrypoint prefix

Authoritative business-rule entrypoints use a `validate...` prefix. Examples:

- `validateClientDocumentRules`
- `validateClientTypeRules`
- `validateClientBusinessRules`

Helper predicates such as `isValidCpf` and `isValidCnpj` may remain private support functions, but exported rule entrypoints must follow the `validate...` convention.

### D2.1 Preferred `clients/rules.ts` public API

The client feature should expose a small, explicit rule surface instead of many overlapping validators.

Preferred exported entrypoints:

- `validateClientDocumentRules(input)`
- `validateClientBusinessRules(input)`

Preferred private support helpers:

- `isValidCpf(value)`
- `isValidCnpj(value)`
- `isRepeatedDigits(value)`

Notes:

- `validateClientDocumentRules(input)` is the main validator for document-required, CPF/CNPJ validity, and type-dependent document semantics.
- `validateClientBusinessRules(input)` is optional and should exist only if the feature needs one aggregate validator that composes multiple narrower `validate...` functions.
- `validateClientTypeRules(input)` should only exist if the feature later gains pure type rules that are meaningfully separate from document validation. It is not required for the current `clients` scope.

### D3. Schema and API layers may reuse rules without owning them

`schemas/form.ts` may call `rules.ts` during `superRefine` so the UI gets immediate feedback, but `schemas` is not the authoritative home of business rules.

`api/create.ts` and `api/update.ts` may call `rules.ts` before writes so the server remains authoritative, but API modules are not the canonical home of pure validation logic.

## Rule Placement

- `schemas/*`: structural input and URL state validity
- `rules.ts`: pure client business invariants
- `api/lookups.ts`: persisted-state lookup checks
- `api/*.ts`: transport, Prisma-backed access, and write orchestration
- `utils/*`: normalization, formatting, and generic helpers only

## Risks / Trade-offs

- [Risk] One `rules.ts` file could grow over time. -> Mitigation: keep it focused on pure validation only and split later only when feature complexity justifies it.
- [Risk] Schema and API code may still duplicate call sites. -> Mitigation: duplication of usage is acceptable, but the rule implementation itself must live only in `rules.ts`.

## Migration Plan

1. Update the implementation contract and OpenSpec capability specs to describe `rules.ts` as the canonical home for pure feature business validation.
2. Create `src/features/clients/rules.ts` and move the contents of `utils/validation.ts` into it.
3. Rename exported rule entrypoints to the `validate...` convention where needed.
4. Update `schemas/form.ts` and write handlers to import from `rules.ts`.
5. Keep hooks, components, routes, and read queries behaviorally stable.
6. Add or update tests that verify the business rules still behave the same after relocation.
