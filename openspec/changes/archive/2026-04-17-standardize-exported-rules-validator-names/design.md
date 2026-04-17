## Context

The repository already standardizes the private `rules.ts` helper contract, but the exported validator names still drift across features. The main inconsistency is in primary write validators: fees and contracts expose `validate<Feature>WriteRules`, while employees and clients use broader or narrower names like `validateEmployeeBusinessRules` and `validateClientDocumentRules`.

The codebase also exposes a few more granular validators from `remunerations/rules.ts`, even though those helpers are not consumed outside the feature-local write aggregator. That weakens the public shape of `rules.ts` without adding useful feature-barrier clarity.

## Goals / Non-Goals

**Goals:**

- Standardize the primary exported `rules.ts` write-validator name to `validate<Feature>WriteRules` where a feature exposes one main write-validation entrypoint.
- Keep form schemas and tests consuming the same predictable validator name across employee, client, fee, contract, and remuneration slices.
- Reduce unnecessary exported surface in `rules.ts` where finer-grained validators are only internal helpers.
- Preserve every validation result, message, and field path.

**Non-Goals:**

- Changing any business rule or user-facing validation copy.
- Renaming specialized validators that intentionally describe a different boundary, such as post-resolution contract validation.
- Changing feature barrels, route composition, or server-side lookup logic.
- Introducing new shared abstractions for validation.

## Decisions

### 1. Standardize the primary public write validator as `validate<Feature>WriteRules`

When a feature has one main exported validator consumed by `schemas/form.ts` for write validation, that export will use the `validate<Feature>WriteRules` pattern.

**Why:** This is already the dominant pattern in the repo and it gives every feature the same primary public signal.

**Alternatives considered:**
- Keep the existing mix because all names already start with `validate`. Rejected because the prefix alone does not remove the cross-feature naming drift.
- Standardize on a more generic `validate<Feature>Rules`. Rejected because `WriteRules` communicates the boundary more precisely.

### 2. Keep specialized secondary validators descriptive when they are not the primary write entrypoint

Validators that serve a distinct boundary after lookup or resolution, such as `validateResolvedContractWriteRules`, will keep descriptive names instead of being forced into the primary pattern.

**Why:** The goal is consistency for the main public write-validator entrypoint, not flattening distinct validation phases into ambiguous names.

**Alternatives considered:**
- Rename every exported validator to match one exact suffix. Rejected because it would reduce clarity for specialized boundaries.

### 3. Make non-shared granular validators private when only the aggregate write validator uses them

If a more granular exported validator is only used inside its own `rules.ts` file, it will become private.

**Why:** This keeps the exported surface focused on the real feature boundary and avoids documenting internal decomposition as public contract.

**Alternatives considered:**
- Leave granular helpers exported for possible future reuse. Rejected because speculative public API surface creates avoidable drift.

## Risks / Trade-offs

- [Risk] Renaming exported validators can break imports in schemas or tests. → Mitigation: update all call sites in one pass and verify with type-checking plus targeted tests.
- [Risk] A contributor may assume every exported validator must end in `WriteRules`, including specialized post-resolution checks. → Mitigation: encode the distinction in the spec and preserve the contract-specific contract validator naming.
- [Risk] Making granular remuneration validators private could surprise future callers if they were planning to import them. → Mitigation: verify there are no current external call sites before narrowing the export surface.

## Migration Plan

1. Update the specs to distinguish primary write-validator naming from specialized secondary validators.
2. Rename employee and client primary validators to the canonical `validate<Feature>WriteRules` shape.
3. Narrow remuneration granular validators to private helpers if no external usage exists.
4. Update feature schemas and tests to use the renamed exports.
5. Run `pnpm check`, `npx tsc --noEmit`, and targeted validation tests.

Rollback is low-risk: restore the previous export names and corresponding imports without changing any validation logic.

## Open Questions

- Should client validation keep a more specific public name because it currently focuses on document semantics, or should the feature still converge on the same write-level entrypoint as the other slices?
