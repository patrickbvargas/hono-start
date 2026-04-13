# Data Access

## Purpose

This document defines the repository-specific persistence contract. It describes how this repository must implement storage, queries, seeding, and integrity through Prisma and server-side data access.

The goal of this document is to define reusable persistence patterns that can survive a domain swap. Domain docs decide what the entities mean; this document decides how persistence concerns are structured.

## Persistence Principles

- Prisma is the canonical ORM in this repository.
- Generated Prisma artifacts are not edited manually.
- When the product is multi-tenant, tenant-scoped entities use one canonical tenant foreign key such as `firmId`, except global lookup tables and provider-owned tables.
- Primary keys are internal identifiers and must not become the application identity of lookup-backed selections.

## Identifier Strategy

- Business tables use `Int` auto-increment primary keys.
- Business foreign keys use `Int`.
- IDs are internal identifiers rather than public business meaning.
- BetterAuth tables are the explicit exception and may use string identifiers by library convention.

## Timestamp Strategy

- Tables use `createdAt` and `updatedAt` by default.
- Append-only log tables are the exception and stay immutable with `createdAt` only.

## Core Persistence Rules

- In multi-tenant products, every tenant-scoped query must scope by the authenticated tenant key.
- Default entity queries filter `deletedAt: null` unless the feature intentionally exposes deleted records.
- Active and deleted status remain independent concerns in persistence logic.
- Entity option queries filter `deletedAt: null` and `isActive: true`.
- Lookup option queries return all rows and use UI disabling for inactive values.
- Lookup-backed application state and URL state use lookup `value`, not database `id`.

## Lookup Strategy

- Categorical values are modeled as lookup tables.
- Lookup rows are referenced by stable `value` semantics at the application boundary.
- Server-side handlers resolve lookup `value` to relational identifiers for reads and writes.
- Lookup values are seeded and expected to remain semantically stable across environments.
- Lookup rows follow the conceptual structure of `id`, `value`, `label`, and `isActive`.
- Lookup rows are sorted by `label` when displayed.
- Lookup rows are not created, renamed, or deleted through the product UI.

## Financial Precision

- Monetary and percentage values must preserve decimal precision.
- Financial arithmetic must not rely on JavaScript floating-point behavior.
- Derived numeric values must remain reproducible from persisted source data.

## Delete And Restore Semantics

- Entity deletions are soft deletes.
- Restore flows must preserve prior cascade intent.
- Cascading delete and restore operations run inside transactions.
- Child records that are configured for retention remain preserved rather than being deleted as a side effect of parent deletion.

## Query Shape Rules

- List queries are server-driven and validated before execution.
- Paginated queries require deterministic ordering.
- Sorting must append a stable tiebreaker.
- `findMany` and `count` for paginated views must remain logically aligned.
- Includes and selects must stay minimal and intentional.

## Query Contract

- URL-driven filter and sort state is validated by feature search schemas.
- Each feature owns its allowed filter and sort fields in its local schema contract.
- Features translate validated search state into persistence-layer `where` and `orderBy` logic in the API layer.
- Relation sorting and filtering remain explicit and type-safe.
- Feature-specific filter and sort semantics are defined outside this document.

## Uniqueness And Integrity

- Domain-defined identifiers and relation constraints must be enforced consistently.
- Partial-uniqueness cases that exceed declarative Prisma support must still be preserved by migrations and service-layer checks.
- Multi-table integrity rules must be guarded both by persistence design and server-side validation.

## Indexing And Partial Uniqueness

- In multi-tenant products, tenant-scoped tables index the tenant key, `deletedAt`, and `isActive`.
- Additional indexes support common parent-child traversals, assignment traversals, and append-only log lookups.
- Partial unique indexes are required for:
  - one active association per scoped parent when the product requires singular active membership
  - one active categorized child per scoped parent when the product forbids duplicates by category
  - one active sequenced child per scoped parent when the product requires unique sequence numbers

## Seed And Environment Assumptions

- Lookup values must be seeded before the application is considered operational.
- Any required initial tenant bootstrap or project-level defaults are part of environment setup, not ad hoc runtime behavior.

## Authentication Tables

- BetterAuth manages session, account, and verification tables.
- The authentication provider owns those schemas by library convention.
- Session and account identifiers use string IDs by BetterAuth convention.

## Derived State

- Derived values must be computed from persisted source data rather than stored redundantly.
- The exact derived-value inventory is part of product truth, not persistence mechanics.

## Seed Contract

- Lookup catalogs must be seeded before the application is operational.
- Seeded lookup identities remain stable by `value`, not by numeric `id`.

## Audit Persistence Contract

- Audit records are append-only when the product includes an audit trail.
- Audit records carry a structured change payload suitable for historical inspection.
- Audit persistence must support the product-defined audit contract.

## Implementation Boundary

- Query construction belongs in feature API modules.
- Routes do not construct Prisma filters or order clauses.
- Shared data-access helpers may support features, but feature ownership remains local.
- Product-rule enforcement stays in the service or API layer; database constraints are a safety net rather than the primary contract.
- If a future project replaces the business domain but keeps this repository pattern, this document should remain mostly unchanged.
