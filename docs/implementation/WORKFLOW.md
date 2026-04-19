# Workflow

## Purpose

This document defines the canonical implementation sequence for new work in this repository.

It is intended to remain reusable even if another project adopts the same repository pattern with a different domain contract.

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
5. Keep `if` statements braced and avoid nested feature-folder barrels.

Before finishing:

1. Update the owning docs if project truth changed.
2. Check that overlapping summary docs still point to the canonical rule instead of contradicting it.
3. Verify the result against `docs/implementation/QUALITY_SCORE.md`.
