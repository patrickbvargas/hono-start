## Context

The repository already has a shared validation issue contract in `src/shared/types/validation.ts`, and the employee slice is the clearest example of the target shape: pure business validation helpers return reusable issues, and Zod schemas adapt them into `ctx.addIssue` calls.

The remaining inconsistency is that some feature schemas still inline business-rule refinements directly in the schema file. That makes the validation story less reusable and harder to replicate across slices.

## Goals / Non-Goals

**Goals:**

- Standardize feature-local pure validation helpers on a shared `ValidationIssue[]` return contract.
- Keep Zod schemas responsible for adapting validation issues into Zod refinement errors.
- Apply the pattern only where schema-side business validation exists today.
- Preserve existing Portuguese user-facing messages and business behavior.

**Non-Goals:**

- Changing any business rule, authorization rule, or database lookup rule.
- Introducing a generic validation engine or a new cross-feature framework.
- Converting server-side assertion helpers that intentionally throw into issue-returning helpers.
- Changing mutation orchestration or route composition.

## Decisions

### 1. Use a shared `ValidationIssue[]` contract for pure business validation

Pure validation helpers will return an array of `{ path, message }` issues rather than coupling themselves to Zod.

**Why:** This supports multiple field errors from a single helper, keeps helpers reusable outside Zod, and gives every feature the same return shape.

**Alternatives considered:**
- Return a single message string per helper. Rejected because it does not scale to multiple issues and pushes field mapping into callers.
- Throw errors from pure validators. Rejected because exception flow is noisier for schema refinements and hides multi-issue validation.

### 2. Keep Zod translation in the schema layer

`schemas/form.ts` will remain the adapter boundary: it will call the helper, loop over the issues, and emit `ctx.addIssue` entries.

**Why:** The schema already owns request-shape validation. Keeping the adapter there prevents pure helpers from becoming Zod-aware and preserves clear ownership.

**Alternatives considered:**
- Put `ctx.addIssue` inside the validation helper. Rejected because it makes the helper schema-specific and less reusable.
- Add a shared adapter function in `shared/`. Rejected for now because this is a small, stable pattern and premature abstraction is not justified yet.

### 3. Roll out the pattern only to feature slices that actually perform schema-side business validation

The implementation will update slices that currently mix request-shape validation with business-rule refinements in the schema file.

**Why:** That is the surface area that benefits from the new pattern. Server-side lookup checks and persistence assertions already live in the correct boundary.

**Alternatives considered:**
- Convert every validation helper in the repo to return issues. Rejected because some helpers are intentionally server-side assertions and should remain throw-based.

### 4. Keep feature-local validation helpers feature-local

The shared issue type is global, but feature-specific rule evaluation stays inside each feature slice.

**Why:** The contract is shared, not the business logic. That matches the repository’s feature-boundary rules.

**Alternatives considered:**
- Move feature validation rules into a shared validation module. Rejected because the rules are domain-specific and the repo explicitly avoids premature abstraction.

## Risks / Trade-offs

- [Risk] The shared issue contract can tempt developers to centralize business rules too early. → Mitigation: keep only the issue shape shared; keep rule evaluation in each feature slice.
- [Risk] Some feature schemas may still be direct enough that a helper adds a layer without much benefit. → Mitigation: only apply the pattern where there is actual reusable business validation.
- [Risk] A future contributor may confuse issue-return helpers with server-side assertion helpers. → Mitigation: keep validation helpers under `utils/validation.ts` and lookup/persistence checks under `api/`.

## Migration Plan

1. Update feature validation helpers that currently return plain messages or inline schema issues to use `ValidationIssue[]`.
2. Update the corresponding `schemas/form.ts` refinements to map those issues into `ctx.addIssue`.
3. Keep existing Portuguese messages unchanged unless a bug is discovered.
4. Run targeted type-checking and validation tests for the affected feature slices.
5. If a regression is found, revert the feature-local validation helper and schema adapter together; the shared issue type can remain in place.

## Open Questions

- Should future server-side validation helpers that need multiple field errors also adopt `ValidationIssue[]`, or should they keep throwing explicit errors because they sit at a different boundary?
- Should the repo eventually add a tiny shared adapter helper for `issues -> ctx.addIssue`, or is the current explicit loop the preferred long-term shape?
