## 1. Prepare And Inspect

- [x] 1.1 Compare `src/features/clients` and `src/features/clients_v2` one final time to confirm `clients_v2` is the implementation currently consumed by `/clientes`.
- [x] 1.2 Search active source, tests, docs, and OpenSpec specs for `clients_v2`, `@/features/clients_v2`, and `src/features/clients_v2` references.
- [x] 1.3 Confirm no database migration is required because this change only promotes a feature slice path and removes obsolete source code.

## 2. Promote Client Slice

- [x] 2.1 Remove the obsolete `src/features/clients` implementation.
- [x] 2.2 Move the full `src/features/clients_v2` tree to `src/features/clients`, preserving its `api/`, `data/`, `rules/`, `hooks/`, `schemas/`, `components/`, `constants/`, `utils/`, public barrel, and tests.
- [x] 2.3 Update imports inside the promoted client slice if any internal path still references `clients_v2`.
- [x] 2.4 Delete the now-empty `src/features/clients_v2` path and do not add a compatibility barrel or alias.

## 3. Update Consumers And Contracts

- [x] 3.1 Update `src/routes/clientes.tsx` and any source/test imports from `@/features/clients_v2` to `@/features/clients`.
- [x] 3.2 Update implementation docs so `src/features/clients` is the named reference slice in architecture and frontend guidance.
- [x] 3.3 Update active OpenSpec specs so `clients`, not `clients_v2`, is the canonical reference slice name.
- [x] 3.4 Keep historical archive changes untouched unless active tooling or validation requires reference cleanup.

## 4. Validate Behavior

- [x] 4.1 Run a final repository search to ensure active code and live contract docs no longer reference `clients_v2`.
- [x] 4.2 Run `pnpm check` and fix all reported issues.
- [x] 4.3 Run `npx tsc --noEmit` and fix all reported issues.
- [x] 4.4 Verify `/clientes` still composes the promoted feature barrel and preserves the same list, overlay, mutation, authorization, and pt-BR feedback behavior.
