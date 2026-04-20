## Why

The current `entity-foundation` spec captures behavioral rules for list screens, filters, option loading, and reference-slice expectations, but it does not yet define the implementation workflow teams should follow when adding a new entity. That gap matters because the repo now has a usable first vertical slice (`employees`), and the next entities are likely to be built by following precedent rather than by re-reading architecture docs every time.

Without a documented workflow standard, the codebase risks drifting in avoidable ways:

- routes may absorb business logic instead of composing feature slices
- new features may skip schema-first design and invent ad hoc payload contracts
- shared abstractions may be extracted too early from a single slice
- future entities may copy employee-specific details instead of the reusable workflow pattern

This change formalizes the implementation workflow for entity slices so future entities can move quickly without treating `employees` as a copy-paste template.

## What Changes

- Extend `entity-foundation` with a workflow-oriented contract for how new entity slices are structured, sequenced, and owned.
- Define the standard build order for new entity work: schemas first, API second, hooks third, components fourth, route wiring last.
- Clarify ownership boundaries between feature slices, routes, and `shared/`.
- Establish a refactor policy that delays shared abstraction extraction until repeated patterns exist across multiple entities.
- Keep the current product scope unchanged by documenting workflow only; this change does not introduce or modify business entities directly.

## Capabilities

### Modified Capabilities
- `entity-foundation`: Gains implementation workflow requirements for feature slice structure, build sequencing, route composition boundaries, and refactor timing.

## Non-goals

- Implementing clients, contracts, revenues, fees, remunerations, attachments, or audit log features.
- Refactoring `src/features/employees` or `src/shared/**` in this change.
- Creating a generic CRUD framework or base entity factory.
- Changing route URLs, Prisma models, authorization rules, or current employee behavior.

## Impact

- Affected specs: `entity-foundation`
- Affected code: none in this change; this is a documentation/specification change only
- Affected roles: developers and future contributors implementing business entities
- Multi-tenancy: unchanged; workflow continues to require tenant scoping at the server boundary
