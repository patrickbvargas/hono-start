# Quality Score

## Purpose

This rubric defines what high-quality implementation means in this repository. It is intended for human review and agent self-evaluation.

It is also intended to be reusable as a boilerplate review rubric when the domain layer changes but the repository pattern remains the same.

## Scoring Dimensions

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

### 5. Maintainability

- The code lands in the correct slice or shared layer.
- Reuse is introduced only where the contract supports it.
- New abstractions reduce repetition without weakening clarity.

## Failure Conditions

- A route owns business logic that must live in the feature layer.
- A feature imports another feature's internal files.
- Direct `@heroui/*` imports appear in routes or features.
- The implementation bypasses documented form, cache, or overlay patterns.
- Business logic becomes harder to infer after the change.

## Target Outcome

High-quality work in this repository must look unsurprising. A second contributor following the same contract must produce materially similar structure and behavior.

Near-perfect contract alignment means:

- key operational terms are defined rather than implied
- derived behavior is specified precisely enough to avoid divergent implementations
- overlapping summary docs defer to clearly owned canonical rules
- a new contributor can execute the work without having to reverse-engineer expectations from code
