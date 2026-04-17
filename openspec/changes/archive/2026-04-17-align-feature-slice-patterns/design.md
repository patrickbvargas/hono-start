## Context

The codebase already converged on a consistent top-level slice shape and a much cleaner validation contract, but the practical developer experience still varies from feature to feature. The remaining drift is not about business behavior; it is about where equivalent concerns are exposed, how hooks submit validated payloads, how utilities are named, and how much of the slice is considered public.

The important constraint is that “alignment” cannot mean flattening genuinely different business responsibilities into identical code. The target is a uniform house pattern for equivalent responsibilities, while preserving justified differences such as specialized post-resolution validators or feature-specific export functions.

## Goals / Non-Goals

**Goals:**

- Define a canonical public feature-barrel shape so routes and top-level consumers see consistent feature surfaces.
- Standardize equivalent naming for equivalent slice responsibilities, especially default-value helpers and primary orchestration hooks.
- Standardize form-hook submit flow so validated payloads are handled consistently without mixed reparsing, casting, or ad hoc branching.
- Improve cross-feature confidence by extending tests beyond just schemas and rules where orchestration-critical behavior differs today.

**Non-Goals:**

- Rewriting all features into identical code regardless of differing business responsibilities.
- Changing permissions, queries, mutations, or domain behavior merely to make files look symmetrical.
- Forcing all API helper filenames to match if their responsibilities are genuinely different.
- Introducing a shared framework that hides feature ownership behind generic abstractions.

## Decisions

### 1. Standardize by responsibility class, not by raw file count

The alignment pass will compare equivalent responsibilities across slices:
- public barrel exports
- primary form hooks
- default-value helpers
- primary write validators
- validation tests

**Why:** This avoids superficial symmetry. Two features can have different helper files and still be aligned if equivalent responsibilities follow the same contract.

**Alternatives considered:**
- Enforce identical file inventories in every slice. Rejected because it would create filler modules and weaken clarity.

### 2. Keep feature barrels intentionally minimal but consistently useful

Feature barrels should expose the public surface routes need, and equivalent slice categories should be exported consistently across features.

**Why:** The current split between slim barrels (`clients`, `employees`) and much broader barrels (`contracts`, `fees`, `remunerations`) makes the public feature contract uneven.

**Alternatives considered:**
- Export everything from every feature barrel. Rejected because it makes internal modules part of the accidental public API.
- Keep each barrel fully ad hoc. Rejected because it undermines the feature-slice contract.

### 3. Standardize form-hook submit flow around parsed payloads

Primary form hooks should submit the parsed schema result to mutations instead of mixing parse-and-cast flow with parse-and-pass flow across slices.

**Why:** The schema already defines the validated payload shape. Using the parsed value consistently makes the orchestration layer easier to compare and reason about.

**Alternatives considered:**
- Allow each hook to choose its own submit shape. Rejected because this is exactly the kind of low-level inconsistency that spreads silently.

### 4. Standardize naming where the responsibility is equivalent

Equivalent helpers should use equivalent names, such as `default<Feature>CreateValues` for primary create defaults.

**Why:** Naming drift is low-cost individually but high-friction in aggregate when moving between slices.

**Alternatives considered:**
- Ignore naming drift if behavior is correct. Rejected because the purpose of this change is to make slices interchangeable in practice, not just functionally correct.

### 5. Treat validation tests as baseline and orchestration-critical tests as quality backfill

Schema/rules tests remain the minimum baseline. Where slice orchestration conventions are being standardized, targeted tests should back that contract.

**Why:** The current test story is strongest at the validation boundary and weaker in hooks/API orchestration. The alignment effort should improve confidence where standardization is being enforced.

**Alternatives considered:**
- Limit testing to schemas/rules only. Rejected because some of the remaining inconsistency now lives above that layer.

## Risks / Trade-offs

- [Risk] Pushing too hard for sameness could erase useful feature-specific distinctions. → Mitigation: standardize only equivalent responsibilities and keep documented exceptions descriptive.
- [Risk] Public barrel cleanup could break route imports or top-level consumers. → Mitigation: audit all barrel consumers and update imports in one pass.
- [Risk] Hook standardization could change subtle submission behavior. → Mitigation: preserve mutation boundaries and verify with targeted tests plus type-checking.
- [Risk] Naming cleanup can create noisy diffs without obvious runtime value. → Mitigation: keep the scope to conventions that materially affect navigation, comprehension, or public slice usage.

## Migration Plan

1. Update the contract to define the canonical aligned slice pattern for public surface, hook submit flow, and equivalent helper naming.
2. Audit each feature against the contract and classify deviations as justified or drift.
3. Normalize the unjustified drift in barrels, hooks, and equivalent helper naming.
4. Add or update targeted tests for any orchestration-critical conventions touched by the refactor.
5. Run repository verification and review the slices side by side before completion.

Rollback is straightforward: restore the previous export or helper names and corresponding imports if an alignment change proves too opinionated.

## Open Questions

- Should barrel consistency favor the slimmer `clients` / `employees` model or the broader `contracts` / `fees` / `remunerations` model?
- How far should orchestration testing go in this repository before it becomes more ceremony than value?
