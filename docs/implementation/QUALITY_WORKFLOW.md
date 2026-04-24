# Quality Workflow

This document defines the repository's reusable implementation sequence,
reliability expectations, testing rules, and quality rubric.

It is intended to remain valid when the domain layer changes, as long as the
repository keeps the same implementation pattern.

## Standard Feature Sequence

1. Define or update the slice contract in `schemas/`.
2. Implement feature-local server operations in `api/`.
3. Implement orchestration hooks in `hooks/`.
4. Implement presentation components in `components/`.
5. Wire routes after the slice contract already exists.

## Ownership Rule

- Features own business-specific schemas, API logic, hooks, components, constants, and helpers.
- Routes own composition only.
- Shared code is extracted only when the pattern is proven across multiple features.
- Feature slices are validated against the boilerplate matrix in `ARCHITECTURE.md`.
- Equivalent responsibilities across features must use the same ownership and naming pattern unless a documented exception explains the difference.

## Refactor Rule

- Prefer local implementation first.
- Extract to `shared/` only after the repeated contract is stable.
- Do not promote one feature's incidental shape into a global abstraction prematurely.

## Validation Boundary

- All server-facing inputs must be validated before business logic executes.
- Form schemas validate request shape and database-free cross-field rules before business logic executes.
- Input normalization remains separate from business validation and must be applied consistently by the consuming schema or server handler.
- Business constraints must be enforced consistently at the service or server-function boundary.
- Lookup-backed selections that require Prisma or persisted-state checks must be resolved and validated at the server-function boundary rather than inside form schemas.
- Invalid state transitions must fail with user-friendly pt-BR messages.
- URL-driven list state must be validated before it reaches queries.

## Error Handling

- Database and infrastructure failures must be logged server-side with actionable context.
- User-facing errors must remain safe and comprehensible.
- Do not leak stack traces, SQL details, or internal exception messages to the UI.

## Transaction Rules

- Multi-table writes must execute atomically.
- Cascade delete and restore flows must execute inside transactions.
- Partial writes that can break business invariants are forbidden.

## Determinism Rules

- Paginated queries require deterministic ordering.
- Sorting behavior must include a stable tiebreaker.
- Repeated requests with the same inputs must produce the same logical result.
- Query refresh after successful mutations must preserve list consistency.

## Testing Rule

- Feature, refactor, and new-code changes that alter runtime behavior, shared contracts, route orchestration, validation, data access, or reusable abstractions must include focused Vitest coverage for the changed contract.
- Documentation-only, generated-only, formatting, or mechanical metadata changes may omit new Vitest coverage when they do not change runtime behavior or shared contracts.
- If Vitest coverage is impractical for a behavior-changing change, document the reason and run the closest feasible verification before completion.

## Contribution Rule

- A contributor may add behavior, but may not redesign the project's stack, folder structure, or documented house patterns without updating the implementation contract first.
- If a change intentionally alters project truth, update the canonical docs in the same piece of work.

## Contributor Checklist

Before implementing:

1. Read `docs/index.md`.
2. Identify the owning domain and implementation files for the work.
3. Confirm whether the change affects product truth or only implementation.

During implementation:

1. Keep routes thin.
2. Keep feature ownership local.
3. Avoid inventing a second pattern when the contract already defines one.
4. Reuse canonical terminology from the glossary and domain docs.
5. Add focused Vitest coverage for behavior-changing feature, refactor, and new-code work.
6. Keep `if` statements braced and avoid nested feature-folder barrels.

Before finishing:

1. Update the owning docs if project truth changed.
2. Check that overlapping summary docs still point to the canonical rule instead of contradicting it.
3. Verify the result against this document's quality rubric.

## Definition Of Done

A task is not complete until:

- code follows the documented architecture and conventions
- business rules remain intact
- `pnpm check` passes
- `npx tsc --noEmit` passes
- relevant docs stay aligned when the intended behavior or house pattern changes

## Quality Rule

- Do not leave known type or lint errors behind.
- Do not paper over failures with undocumented exceptions or suppressions.

## Review Rubric

Use this rubric for human review and agent self-evaluation.

### 1. Contract Compliance

- The change follows the documented stack and architecture.
- No undocumented house pattern is introduced.
- Imports and ownership boundaries remain intact.

### 2. Business Correctness

- The implementation preserves the documented business rules.
- Role and tenant behavior remain correct when the product uses those concepts.
- Lifecycle states and edge cases are respected.

### 3. Frontend Consistency

- Route composition follows the canonical wrapper, loader, and overlay patterns.
- Forms, tables, drawers, and modals behave consistently with existing slices.
- UI copy remains in pt-BR and user feedback is coherent.

### 4. Reliability

- Validation occurs at the proper boundaries.
- Errors are handled safely.
- Deterministic sorting and list refresh behavior are preserved.
- Multi-step writes remain atomic.
- Behavior-changing feature, refactor, and shared-code changes include focused Vitest coverage for the changed contract.

### 5. Maintainability

- The code lands in the correct slice or shared layer.
- Reuse is introduced only where the contract supports it.
- New abstractions reduce repetition without weakening clarity.

## Failure Conditions

- A route owns business logic that must live in the feature layer.
- A feature imports another feature's internal files.
- Direct vendor UI imports appear in routes or features instead of going through `@/shared/components/ui`.
- The implementation bypasses documented form, cache, or overlay patterns.
- Business logic becomes harder to infer after the change.

## Target Outcome

High-quality work in this repository must look unsurprising. A second contributor following the same contract must produce materially similar structure and behavior.

Near-perfect contract alignment means:

- key operational terms are defined rather than implied
- derived behavior is specified precisely enough to avoid divergent implementations
- overlapping summary docs defer to clearly owned canonical rules
- a new contributor can execute the work without having to reverse-engineer expectations from code
