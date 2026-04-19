## Context

`src/features/clients_v2` is already the working client route implementation and the documented reference slice for the repository's entity-management pattern. The old `src/features/clients` slice remains in the tree with older API module shapes, a flat `rules.ts`, older public exports, and stale tests. This creates two competing client implementations while the route imports only the newer one.

The change is primarily a rename and replacement: promote the current `clients_v2` implementation into the canonical `clients` path, remove the old implementation, and update references that describe the canonical slice. Product behavior for `/clientes` remains unchanged.

## Goals / Non-Goals

**Goals:**

- Make `src/features/clients` the only client-management feature slice.
- Preserve the current `clients_v2` behavior, route-facing public surface, API/data split, rules directory, hooks, schemas, components, and tests under the promoted path.
- Update `src/routes/clientes.tsx`, feature-barrel tests, implementation docs, and active OpenSpec specs to reference `src/features/clients`.
- Remove `_v2` from source paths and active contract language.

**Non-Goals:**

- Do not alter client-management product behavior, permissions, validation messages, tenant isolation, list defaults, or overlay UX.
- Do not introduce a compatibility barrel from `clients_v2` to `clients`.
- Do not refactor unrelated slices beyond replacing references to the canonical client slice name.

## Decisions

### Decision: Promote by replacement, not incremental merge

The implementation should remove the old `src/features/clients` directory and move or copy the current `src/features/clients_v2` tree into `src/features/clients`.

Rationale: the newer slice already expresses the documented architecture. Merging the old implementation into it would preserve obsolete boundaries and increase the chance of reintroducing older behavior.

Alternatives considered:

- Keep both slices and update docs only. Rejected because the old path would remain available for accidental imports.
- Add a `clients_v2` compatibility barrel. Rejected because the user explicitly asked to remove the `_v2` suffix, and compatibility aliases would keep the transitional name alive.

### Decision: Update active contracts to name `clients`

Implementation docs and active OpenSpec specs should treat `src/features/clients` as the reference slice after the promotion. References in active docs/specs to `clients_v2` should be renamed when they describe current or future expected behavior.

Rationale: after the filesystem rename, keeping active contract text pointed at `clients_v2` would make the contract false and confuse future feature work.

Alternatives considered:

- Leave historical archive files untouched except where tests require otherwise. Accepted as the default for archived changes because archive content is historical context, not the live contract.
- Rewrite every archived reference. Rejected unless needed by tooling, because it creates noisy historical churn with little implementation value.

### Decision: Preserve route behavior and public API names

The `/clientes` route should continue consuming the same exported components, query option factories, search schema, and model types, only from `@/features/clients`.

Rationale: the route already works against the newer public barrel. This keeps the change limited to path identity and obsolete implementation removal.

Alternatives considered:

- Rename exported client symbols while promoting the path. Rejected because it expands the blast radius without improving the requested outcome.

## Risks / Trade-offs

- [Risk] Stale imports, tests, or docs may still reference `clients_v2`. -> Mitigation: run a repository search for `clients_v2` after implementation and update active references before validation.
- [Risk] Removing the old `clients` tree may remove tests that still cover pure client behavior. -> Mitigation: preserve or migrate relevant tests from the promoted `clients_v2` test suite under `src/features/clients`.
- [Risk] Generated route or cache artifacts may still point to the old import path. -> Mitigation: run type checking and the project check command after the rename.

## Migration Plan

1. Delete or replace the old `src/features/clients` implementation.
2. Move the current `src/features/clients_v2` implementation to `src/features/clients`.
3. Update imports from `@/features/clients_v2` to `@/features/clients`.
4. Update active docs and OpenSpec specs so `src/features/clients` is the named reference slice.
5. Search for remaining `clients_v2` references and keep only historical archive references if no active tooling consumes them.
6. Run `pnpm check` and `npx tsc --noEmit`.

Rollback is straightforward before release: restore the prior directories and route import from version control. After release, rollback should also restore the implementation docs/specs if the project intentionally returns to the transitional name.

## Open Questions

None. The requested target path and replacement direction are clear.
