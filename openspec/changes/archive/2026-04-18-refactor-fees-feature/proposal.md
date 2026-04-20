## Why

The fees feature has drifted from the canonical feature-slice pattern used by `clients_v2`, `employees`, and `contracts`. Refactoring it now reduces route-facing API drift before more fee and remuneration behavior is added on top of the current one-file-per-operation structure.

## What Changes

- Refactor `src/features/fees` to follow the same slice anatomy and naming convention as the reference features:
  - `api/queries.ts` and `api/mutations.ts` as the route-facing server-function and React Query boundary.
  - `data/queries.ts` and `data/mutations.ts` as the Prisma-backed read/write boundary.
  - `rules/` directory for pure fee business assertions instead of the root `rules.ts` file.
- Rename route-facing query and mutation option factories to the canonical `...QueryOptions` and `...MutationOptions` convention used by `clients_v2`, `employees`, and `contracts`.
- Preserve current fee behavior, validation, authorization, tenant scoping, remuneration synchronization, contract status synchronization, and pt-BR user feedback.
- Update feature-local imports, route imports, hooks, and tests to consume the refactored public surface.
- No database schema, route path, UI workflow, or user-facing business behavior changes are intended.

## Non-goals

- Do not redesign fee, revenue, remuneration, or contract business rules.
- Do not change the `/honorarios` route UX beyond import and naming updates required by the refactor.
- Do not introduce shared abstractions for fees unless they already exist in the documented project pattern.
- Do not alter Prisma schema, migrations, seeded lookup values, or authorization semantics.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `fee-management`: Preserve existing fee-management requirements while aligning the implementation with the canonical feature-slice contract.

## Impact

- Affected feature code: `src/features/fees/**`.
- Affected route code: `src/routes/honorarios.tsx`.
- Affected tests: `src/features/fees/__tests__/**` and any tests importing fee API/rule modules.
- Affected API naming: route-facing exports should converge from `getFeesOptions`, `createFeeOptions`, `updateFeeOptions`, `deleteFeeOptions`, and `restoreFeeOptions` to the canonical `getFeesQueryOptions`, `createFeeMutationOptions`, `updateFeeMutationOptions`, `deleteFeeMutationOptions`, and `restoreFeeMutationOptions` style.
- Roles and multi-tenancy: administrators and regular users keep the same scoped fee visibility and mutation permissions; every read and write remains firm-scoped and session-derived.
