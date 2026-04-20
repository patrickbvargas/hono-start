## Context

The shared docs already say lookup rows should be referenced in code by their stable `value`, not by `id`, because ids differ across environments. The employee implementation previously did the opposite on the client: `FieldOption` was keyed by `id`, form schemas submitted `type` and `role` as numbers, and employee filters had to normalize URL input back into relational ids.

That split leaked relational storage concerns into the client contract. It also made lookup-backed URLs environment-specific and forced UI code to recover domain meaning from database-oriented identifiers. The implemented direction is to let the client work with stable lookup values while preserving Prisma foreign-key relations in the database.

## Goals / Non-Goals

**Goals:**
- Make lookup-backed form state and URL filter state use stable lookup `value` strings.
- Update shared field option primitives so a selected option is keyed by `value` instead of `id`.
- Standardize employee lookup queries on the shared `Option` payload contract.
- Keep relational persistence unchanged by resolving lookup values to ids only at the server boundary.
- Move lawyer-only OAB handling to direct comparisons against stable lookup constants in the form and Zod validation layer.
- Reduce schema duplication on lookup-backed filters by keeping one value-based filter schema.

**Non-Goals:**
- Migrating Prisma lookup tables to enums.
- Removing numeric ids from database rows or API payload metadata entirely.
- Changing business-entity option loaders that correctly use ids and active-only filtering.
- Expanding the change beyond the employee slice and shared lookup field contract.

## Decisions

### D1. Lookup-backed client contracts use `value` as the selected key

Shared field components that render lookup-backed options will treat `FieldOption.value` as the selection key. Employee form schemas and lookup-backed filter schemas will therefore store `"LAWYER"` and `"ADMIN"` rather than numeric ids.

This aligns the client contract with the documented rule that lookup rows are referenced by stable values and eliminates environment-specific ids from URL state.

Alternative considered: keep client state numeric and add more helper selectors. Rejected because it preserves the same duplicated parsing and option-search problems.

### D2. Shared option payloads continue carrying relational metadata, but no longer expose `id` as the UI key

Lookup option payloads continue to be parsed through the shared `optionSchema`, which exposes `value`, `label`, `isDisabled`, and optional `id` metadata. The shared `FieldOption` contract no longer requires `id` as the selected key, and the shared autocomplete/listbox components bind to `value` so lookup-backed forms can opt into stable string identity end-to-end.

Alternative considered: keep employee-specific transformed option types for `isLawyer` and `isAdmin`. Rejected because the shared option payload plus stable constants is sufficient and reduces feature-specific indirection.

### D3. Server handlers resolve lookup values to ids at the Prisma boundary

Employee create, update, and list-filter server handlers will accept lookup values from the client, translate them to the corresponding lookup rows by `value`, and only then build Prisma `where` clauses or mutation payloads using `typeId` and `roleId`.

This keeps Prisma relations unchanged while preventing relational ids from leaking into URL state or form validation.

Alternative considered: change database relations to string enums or value-based foreign keys. Rejected because it would fight the current Prisma schema and broaden the migration unnecessarily.

### D4. Business rules compare lookup values directly

Employee-specific logic such as lawyer-only OAB handling compares the selected lookup `value` directly against stable constants. The form clears `oabNumber` when the selected type changes away from `LAWYER`, and the Zod schema enforces that OAB is required when the selected type is `LAWYER`.

Alternative considered: enforce an additional server-side invariant that non-lawyer submissions must always reject any OAB value. Rejected in the current implementation because the form already clears the value on type changes and the persisted contract only needs the positive rule that lawyers require OAB.

### D5. Legacy numeric employee filter URLs are an implementation follow-up, not a proposal blocker

The canonical contract after this change is value-based URL state. Whether the implementation preserves legacy numeric URLs temporarily or treats them as a breaking transition can be decided during implementation, but the new contract itself should be unambiguous in specs and docs.

Alternative considered: require backward-compatible numeric-url parsing in the change scope. Rejected for now because it adds migration complexity without changing the target architecture.

## Risks / Trade-offs

- [Risk] Changing `FieldOption` from `id` to `value` may affect business-entity fields that currently rely on numeric ids. → Mitigation: update shared field APIs deliberately and keep mixed id-based entity option flows on a separate contract if needed.
- [Risk] The server now needs lookup-resolution steps before mutations and relational filters. → Mitigation: centralize the value-to-id translation inside feature server functions or dedicated lookup helpers.
- [Risk] Existing bookmarked employee filter URLs using numeric ids may stop working. → Mitigation: call out the URL contract change as breaking and decide during implementation whether to add a temporary compatibility path.
- [Risk] Partial adoption would make the codebase more confusing by mixing id-based and value-based lookup contracts. → Mitigation: apply the new contract end-to-end for the employee slice and the shared lookup field primitives in one change.
