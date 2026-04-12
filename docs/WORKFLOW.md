# Entity Implementation Workflow

This document captures the delivery sequence for new entity slices. It complements [ARCHITECTURE.md](./ARCHITECTURE.md) and [CONVENTIONS.md](./CONVENTIONS.md) by focusing on build order, ownership boundaries, and refactor timing rather than repeating static repository rules.

## Purpose

Use `src/features/employees` as the workflow reference slice for future entity work. Treat it as a baseline for boundaries and sequencing, not as a copy-paste template for employee-specific behavior, field names, validation rules, or lookup semantics.

When a new entity needs to deviate from the employees workflow shape, document why the entity requires that difference instead of changing the structure by preference.

## Standard Sequence

Build new entity slices in this order:

1. Define the feature contract in `schemas/`
2. Implement feature-local server operations in `api/`
3. Add orchestration hooks in `hooks/`
4. Add presentation components in `components/`
5. Wire the route after the feature contract already exists

The expected contract starts with:

- `model`
- `form`
- `filter`
- `sort`
- `search`

Optional pieces may be omitted when the entity does not need them, but route composition must remain the last step.

## Ownership Boundaries

Feature slices own entity-specific behavior:

- schemas
- server operations
- orchestration hooks
- presentation components
- feature constants
- pure feature helpers

Routes own composition only:

- validate search state
- prefetch feature queries
- apply route-level authorization
- mount feature UI pieces
- wire overlays after the feature contract exists

Routes do not own:

- Prisma filter construction
- mutation payload design
- cache invalidation flow
- mutation success and error orchestration
- entity-specific business rules

The `shared/` layer stays generic. It may host primitives, reusable field components, infrastructure, formatters, helpers, and hooks only when those pieces are not tied to one entity's domain rules.

## Refactor Policy

Prefer local implementation first.

1. First entity proves the pattern locally.
2. Second entity exposes what is truly repeated.
3. Shared extraction happens only after the common contract is stable.

Do not move code into `shared/` just because it exists once in `employees`. Extract only the behavior that repeated across entity slices, and shape the abstraction around the stable common contract instead of one feature's incidental details.
