## Context

The repository already has a visible `rules.ts` convention across most feature slices: exported validators use a `validate...` prefix, and private helpers that detect a single business-rule violation commonly return `ValidationIssue | null` and use `get...Issue` names. The employee slice is the notable exception because it still uses `get...Message` helpers that return plain strings and leaves the `ValidationIssue` object construction to the exported validator.

This is a cross-feature consistency change, but not a behavioral one. The main constraint is to preserve every existing validation outcome, error message, and field path while making the shape of the pure validation layer uniform across features.

## Goals / Non-Goals

**Goals:**

- Define one canonical `rules.ts` naming pattern for exported validators and private single-issue helpers.
- Standardize pure business-rule helpers on returning `ValidationIssue` objects directly when they represent a single issue.
- Align the employee feature with the same helper contract already used by contracts, fees, and remunerations.
- Keep the change safe to apply incrementally, with tests verifying no business behavior changes.

**Non-Goals:**

- Changing any domain rule, validation message, or path semantics.
- Renaming every exported validator in the repository merely for stylistic uniformity.
- Moving Prisma-backed checks, lookup resolution, or throw-based server assertions into issue-returning helpers.
- Introducing a new shared abstraction beyond the existing `ValidationIssue` type.

## Decisions

### 1. Treat `ValidationIssue` as the canonical return shape for pure `rules.ts` helpers

Private helpers in `rules.ts` that represent a single business-rule failure will return `ValidationIssue | null` rather than `string | null`.

**Why:** This makes the helper self-describing, keeps field-path ownership next to the rule that raised the issue, and matches the dominant pattern already used in the repo.

**Alternatives considered:**
- Keep returning only messages and build issue objects in the exported validator. Rejected because it spreads one rule across two places and is the main source of current drift.
- Return arrays from every helper. Rejected because single-issue helpers are clearer as `ValidationIssue | null`; arrays are still appropriate for exported aggregators.

### 2. Standardize private single-issue helper names as `get...Issue`

If a private helper returns one `ValidationIssue | null`, its name will end with `Issue`.

**Why:** The suffix advertises both purpose and return shape. It also makes feature `rules.ts` files easy to scan because helper names and local variable names line up with the returned object type.

**Alternatives considered:**
- Allow mixed `get...Message` and `get...Issue` names as long as exported validators stay consistent. Rejected because that preserves the same ambiguity this change is fixing.
- Rename helpers to `validate...` as well. Rejected because exported entrypoints already own the public validator naming contract; reusing that prefix internally would blur the boundary.

### 3. Keep exported validator naming stable unless the exported contract is already unclear

The proposal will standardize the helper pattern first. Exported validators will continue to use the documented `validate...` prefix, and only direct call sites tied to the refactor will change.

**Why:** The strongest existing contract is the `validate...` prefix, not a single universal suffix for all exported validators. A separate change can address exported validator suffixes if the team wants broader API renaming later.

**Alternatives considered:**
- Rename all exported validators now to a single `validate<Feature>WriteRules` convention. Rejected because it expands scope from safe internal normalization to a larger public API rename sweep.

### 4. Review all feature `rules.ts` modules, but only change true convention drift

The implementation will inspect every feature `rules.ts` file and normalize only helpers that diverge from the established contract.

**Why:** This keeps the change focused and prevents unnecessary churn in files that already match the pattern.

**Alternatives considered:**
- Touch every `rules.ts` file for cosmetic uniformity. Rejected because it adds review noise without improving the contract.

## Risks / Trade-offs

- [Risk] A rename-only cleanup could accidentally change exported imports or test wiring. → Mitigation: keep exported API changes minimal and update direct schema/test call sites together.
- [Risk] Future contributors may over-apply the `...Issue` suffix to helpers that do not actually return `ValidationIssue | null`. → Mitigation: capture the rule explicitly in the spec and keep examples anchored in `rules.ts`.
- [Risk] The repository still has some variation in exported validator suffixes (`WriteRules`, `DocumentRules`, `BusinessRules`). → Mitigation: treat that as a separate decision and keep this change focused on the helper contract that is already mostly stable.
