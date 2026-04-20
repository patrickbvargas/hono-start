# Documentation Reading Guide

This guide explains what each canonical file is for and how to review the set efficiently.

It is a companion to `docs/index.md`, not a replacement for it.

## Fast Review Path

If you need the shortest reliable onboarding path:

1. `docs/index.md`
2. `docs/domain/PRODUCT_SENSE.md`
3. `docs/domain/DOMAIN_MODEL.md`
4. `docs/domain/BUSINESS_RULES.md`
5. `docs/domain/ROLES_AND_PERMISSIONS.md`
6. `docs/implementation/ARCHITECTURE.md`
7. `docs/implementation/CONVENTIONS.md`
8. `docs/implementation/FRONTEND.md`

Read the remaining files before implementing anything non-trivial.

## Full Reading Order

Use the canonical order from `docs/index.md`.

## What Each File Owns

### `docs/domain/PRODUCT_SENSE.md`

Owns:

- what the product is
- who it serves
- product goals and non-goals
- invariants that define product identity

### `docs/domain/DOMAIN_MODEL.md`

Owns:

- business entities
- relationships
- lifecycle concepts
- tenant model
- financial-domain concepts

### `docs/domain/BUSINESS_RULES.md`

Owns:

- mandatory business constraints
- lifecycle rules
- remuneration logic
- deletion and restore rules
- contract status rules

### `docs/domain/ROLES_AND_PERMISSIONS.md`

Owns:

- role model
- visibility model
- action-level permission boundaries
- protected and shared operations

### `docs/domain/FEATURE_BEHAVIOR.md`

Owns:

- feature-area intent
- product surfaces
- route inventory
- screen-level behavioral expectations
- high-level use cases

It does not own low-level validation or permission rules when those are already defined elsewhere.

### `docs/domain/LOOKUP_VALUES.md`

Owns:

- canonical lookup catalogs
- stable `value` and pt-BR `label` pairs

### `docs/domain/QUERY_BEHAVIOR.md`

Owns:

- filter semantics
- sort semantics
- URL-driven list behavior
- pagination-related expectations

### `docs/domain/USER_FLOWS.md`

Owns:

- step-by-step canonical workflows
- expected system reaction during normal use

### `docs/domain/EDGE_CASES.md`

Owns:

- exceptional and failure-case expectations

### `docs/domain/SUCCESS_CRITERIA.md`

Owns:

- what success looks like for the product
- what success looks like for the contract itself

### `docs/domain/GLOSSARY.md`

Owns:

- shared vocabulary
- term normalization across business and implementation discussion

### `docs/implementation/STACK.md`

Owns:

- fixed technical stack choices
- explicitly open technical choices

### `docs/implementation/ARCHITECTURE.md`

Owns:

- repository shape
- feature-slice anatomy
- dependency boundaries
- public-surface rules

### `docs/implementation/DATA_ACCESS.md`

Owns:

- persistence contract
- query ownership
- lookup resolution strategy
- transaction and integrity expectations

### `docs/implementation/CONVENTIONS.md`

Owns:

- naming
- export rules
- TypeScript rules
- form-hook and mutation conventions

### `docs/implementation/FRONTEND.md`

Owns:

- route composition rules
- wrapper and overlay patterns
- list and table patterns
- interaction conventions

### `docs/implementation/SECURITY.md`

Owns:

- trust boundaries
- tenant isolation rules
- authorization enforcement rules
- secret and environment handling

### `docs/implementation/RELIABILITY.md`

Owns:

- validation boundary expectations
- error-handling doctrine
- transactional expectations
- definition of done

### `docs/implementation/WORKFLOW.md`

Owns:

- standard implementation sequence
- feature ownership sequencing
- refactor timing rules

### `docs/implementation/QUALITY_SCORE.md`

Owns:

- evaluation rubric for aligned work

## Review Questions

Use these questions while reading:

- Is the product scope still correct?
- Are entities and relationships still correct?
- Are any business rules ambiguous or split across too many files?
- Can role and visibility behavior be implemented without guessing?
- Can a contributor identify the canonical route, form, list, and mutation patterns without reading code?
- Would two different agents likely produce materially similar implementations from these docs alone?
