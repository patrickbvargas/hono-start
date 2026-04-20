## Why

The `clients` feature currently spreads pure business validation across multiple files. A maintainer tracing one client rule must move between `schemas/form.ts`, `utils/validation.ts`, and the write handlers in `api/create.ts` and `api/update.ts`.

That distribution is a poor fit for the repository's goal of becoming a reusable boilerplate with predictable feature internals. The current client slice does work, but pure business validation is not discoverable from one canonical place.

## What Changes

- Introduce a single canonical feature-local business-rule file at `src/features/clients/rules.ts`.
- Move pure client business validation from `utils/validation.ts` into `rules.ts`, keeping `utils/` limited to generic helpers such as normalization, formatting, and defaults.
- Standardize pure business-rule function names on a `validate...` prefix so rule entrypoints are easy to discover and grep.
- Update `schemas/form.ts` and the client write handlers to reuse the canonical `rules.ts` functions without changing runtime behavior.
- Keep persisted lookup and database-backed checks in `api/` for now; this change does not introduce `services/`, `domain/`, or `data/`.

## Non-Goals

- Changing client-facing behavior, permissions, route URLs, or tenant isolation semantics.
- Changing the underlying client domain rules for CPF/CNPJ, active state, or delete/restore protections.
- Refactoring every feature slice in the same change; this proposal uses `clients` as the first migration target and the reference implementation for later rollout.
- Introducing `services/`, `domain/`, `data/`, or response-schema architecture in this change.
- Replacing Prisma or introducing a generic CRUD framework.

## Capabilities

### Modified Capabilities
- `entity-foundation`: define the canonical home and naming pattern for feature-local pure business validation.
- `client-management`: keep the current client behavior while relocating pure client validation into `rules.ts`.

## Impact

- Affected code: `src/features/clients/**` and the client feature barrel.
- Affected docs/specs: implementation architecture docs plus `openspec/specs/entity-foundation/spec.md` and `openspec/specs/client-management/spec.md`.
- Affected tests: client validation tests and write-path tests must verify behavior stays stable while rule placement changes.
