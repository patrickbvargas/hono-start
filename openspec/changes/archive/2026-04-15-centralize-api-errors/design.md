## Context

The repository currently stores Portuguese error messages as inline string literals across feature validation helpers, lookup resolvers, resource guards, and API handlers. In several mutation handlers, the same message appears twice: once in the throw site and again inside `hasExactErrorMessage(...)` at the catch site.

Each feature already has a `constants/` folder, but the contents are mixed together in single `index.ts` files. That makes the constants surface harder to scan and encourages unrelated values to live side by side.

This change affects all major feature slices: clients, contracts, employees, fees, and remunerations. It also touches the shared error-mapping helper that currently only accepts a list of literal messages.

## Goals / Non-Goals

**Goals:**
- Centralize each feature's Portuguese errors into a canonical `constants/errors.ts`.
- Remove duplicate literal error lists from `hasExactErrorMessage(...)` call sites.
- Split feature `constants/index.ts` content into focused modules by responsibility.
- Preserve current user-facing messages and runtime behavior.
- Keep the migration mechanical enough that the feature-by-feature rollout stays low risk.

**Non-Goals:**
- Replacing string-message errors with numeric error codes.
- Changing the Portuguese text seen by users.
- Renaming business concepts or authorization rules.
- Refactoring unrelated shared modules unless they need the new catalog shape.

## Decisions

### 1. Use an object-based error catalog per feature
Each feature will define an `ERRORS` object in `constants/errors.ts`, with `UPPER_SNAKE_CASE` keys and pt-BR string values.

Rationale:
- Keeps the canonical text in one place.
- Makes call sites self-documenting.
- Allows future grouping by domain area without changing the helper API again.

Alternatives considered:
- A flat array of strings: rejected because it loses semantic names and makes imports harder to read.
- Error classes or numeric codes: rejected because this change is about deduplication and organization, not a wider exception model shift.

### 2. Expand `hasExactErrorMessage(...)` to accept either arrays or error catalogs
The helper will continue to support direct string arrays for compatibility, but it will also accept a string-valued record and normalize it internally before comparison.

Rationale:
- Minimizes churn during migration.
- Lets existing code keep working until each feature is updated.
- Avoids a second helper just for catalogs.

Alternatives considered:
- Replace the helper with a new catalog-only function: rejected because it would create parallel APIs and more migration overhead.
- Keep the current signature and pass `Object.values(...)` everywhere: rejected because it still duplicates normalization logic at every call site.

### 3. Split feature constants by responsibility
Each feature's `constants/` directory will be decomposed into focused files such as `cache.ts`, `values.ts`, `sorting.ts`, and `errors.ts`, with `index.ts` acting only as the export surface.

Rationale:
- Prevents `index.ts` from becoming a dumping ground.
- Makes the intent of each constant easier to find.
- Keeps the structure consistent across features.

Alternatives considered:
- Keep a single `index.ts` per feature and only add `errors.ts`: rejected because the user explicitly wants the rest of the content separated too.

### 4. Migrate feature-by-feature, not all at once in a single atomic rewrite
The rollout will update one feature slice at a time, then finish with the shared helper and any remaining shared usage that is part of the same error contract.

Rationale:
- Reduces review risk.
- Keeps diffs readable.
- Makes it easier to verify that no user-facing messages changed.

## Risks / Trade-offs

- [Risk] A partial migration could leave some messages in catalogs and some still inline. → Mitigation: add tasks that cover each feature slice explicitly and verify remaining literal errors with a repository search.
- [Risk] Broadening `hasExactErrorMessage(...)` may hide accidental use of unrelated catalogs. → Mitigation: keep the helper string-valued only and compare on exact message text, not on object keys.
- [Risk] The `constants/index.ts` split may introduce import churn and circular import mistakes. → Mitigation: keep the new files shallow, re-export only from the index, and update imports mechanically within each feature.
- [Risk] Shared session authorization messages may be overlooked because they live outside `src/features/*`. → Mitigation: treat them as follow-up unless they are needed for the same migration pass.

## Migration Plan

1. Add `constants/errors.ts` and any smaller constants files for each feature slice.
2. Update feature validation helpers, lookup resolvers, and resource guards to import named error constants.
3. Update feature API handlers to use the canonical error catalog in `hasExactErrorMessage(...)`.
4. Update `src/shared/lib/error-mapping.ts` to accept catalog objects in addition to arrays.
5. Run repository-wide searches for leftover inline feature error strings and replace them where they belong.
6. Verify the resulting behavior with existing checks and targeted tests.

Rollback strategy:
- Restore the previous helper signature if needed.
- Revert one feature slice at a time if a regression appears.

## Open Questions

- Should shared authorization messages in `src/shared/session/policy.ts` be migrated in the same change, or should they remain a follow-up since they are not feature-local?
- Should every feature's `constants/index.ts` re-export `errors.ts` directly, or should consumers import from the specific file when they only need errors?
