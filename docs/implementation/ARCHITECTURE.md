# Architecture

This document defines the reusable house architecture of the repository.

It should remain valid even if the domain layer is replaced by another product domain.

## Canonical Repository Shape

```text
src/
  features/<feature>/
    api/
    components/
    constants/
    hooks/
    schemas/
    utils/
    index.ts
  routes/
  shared/
    components/
    config/
    hooks/
    lib/
    schemas/
    session/
    types/
  styles/
```

## Slice Pattern

The canonical slice shape for feature work is defined by this document. New feature slices must follow it unless a documented exception exists.

## Canonical Feature Slice Contract

Each feature slice is expected to contain:

- `api/`: feature-local server operations, query or mutation option factories, and server-only lookup resolution used by feature writes
- `components/`: feature-local UI pieces
- `constants/`: cache keys and feature-local constants
- `hooks/`: orchestration hooks such as `use-form`, `use-filter`, `use-delete`, `use-restore`, and `use-options`
- `schemas/`: `model`, `form`, `filter`, `search`, and `sort` contracts, including Zod request schemas and database-free schema refinements
- `utils/`: feature-local pure helpers such as defaults, normalization helpers, formatting helpers, and business validation utilities that do not require Prisma
- `index.ts`: public barrel

## Architectural Rules

- Domain behavior belongs in feature slices under `src/features/<feature>`.
- External consumers must import from a feature's public `index.ts` barrel only.
- Routes own composition, route-level search parsing, prefetching, and authorization wiring.
- Routes must not own feature business logic, Prisma query construction, or mutation orchestration.
- `shared/` is reserved for generic infrastructure, primitives, and reusable building blocks that are not tied to one domain's business rules.

## Public Barrel Rule

Feature barrels expose only the public surface required by routes or other top-level consumers:

- query option factories
- top-level feature UI components
- exported search schema
- exported feature model types

Internal helpers, implementation-only schemas, and server handlers must not leak through the barrel by default.

## Dependency Direction

- Features may depend on `shared/`.
- Routes may depend on features and `shared/`.
- Features must not reach into another feature's internal files.
- Shared code must not depend on feature-local business modules.

## Database Boundary

- Prisma access is centralized through shared database utilities.
- Generated Prisma artifacts are not hand-edited.
- Migration files are generated artifacts, not handwritten source of truth.

## Architectural Intent

- The system is organized around feature-local ownership, not horizontal file-type sprawl.
- Each feature must use the same slice anatomy unless a documented exception exists.
- Route files must read like orchestration code, not like a second implementation layer.
- Business domains may change between repositories; this slice pattern should not.
