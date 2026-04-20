## Context

The repository contract already defines `schemas/form.ts` as the canonical home for request-shape validation and database-free schema refinements, while `schemas/model.ts` owns read-model contracts. In practice, feature slices now use both sides together in hooks, defaults, normalization, and API modules. The contracts are structurally separated, but the names are only partially explicit.

This is most visible in the contracts feature, where nested read models such as `ContractAssignment` and nested write payloads such as `ContractAssignmentInput` coexist alongside top-level write types like `ContractCreate` and `ContractUpdate`. The current top-level write names read like domain entities rather than request payloads, which makes translation code harder to scan.

## Goals / Non-Goals

**Goals:**
- Make every form-side request contract explicitly identifiable as input.
- Preserve concise, ergonomic names for read-model schemas and types.
- Apply one naming rule consistently across `clients`, `employees`, and `contracts`.
- Keep the existing file ownership model intact: `model.ts` for read models, `form.ts` for write inputs.

**Non-Goals:**
- Changing schema semantics, validation rules, or payload shapes.
- Moving schemas between files or changing feature boundaries.
- Renaming filters, search schemas, or sort schemas.
- Adding `Model` suffixes to read-side names.

## Decisions

### Decision: Form-side create, update, and id contracts use `Input`

`schemas/form.ts` exports will use `...InputSchema` for schemas and `...Input` for inferred types. Examples:
- `contractCreateInputSchema` / `ContractCreateInput`
- `contractUpdateInputSchema` / `ContractUpdateInput`
- `contractIdInputSchema` / `ContractIdInput`

This matches the documented repository role of `schemas/form.ts`: request-shape validation, not UI-only form state.

Alternative considered: use `Form` in the symbol names.
Rejected because several contracts in `schemas/form.ts` validate non-form inputs such as delete, restore, and by-id lookups. `Input` stays accurate across both UI submissions and server-facing request payloads.

### Decision: Nested write contracts also use `Input`

Nested write payloads in `schemas/form.ts` will follow the same rule:
- `contractAssignmentInputSchema` / `ContractAssignmentInput`
- `contractRevenueInputSchema` / `ContractRevenueInput`

This keeps top-level and nested write contracts aligned and avoids having one form file mix `Input`-suffixed nested types with unsuffixed top-level write types.

Alternative considered: rename only top-level write contracts.
Rejected because the inconsistency would remain in the same file and preserve some of the current ambiguity.

### Decision: Read-model names remain concise

`schemas/model.ts` keeps concise names such as `contractSchema`, `contractAssignmentSchema`, and `Contract`. These names describe the domain model exposed to routes and feature UI without extra suffix noise.

Alternative considered: rename read-side contracts to `...ModelSchema` and `...Model`.
Rejected because the ambiguity originates on the write side, not the read side, and adding `Model` everywhere would reduce ergonomics without improving the architectural boundary.

### Decision: Apply the rule repo-wide across current entity features

The naming rule will be applied consistently to `clients`, `employees`, and `contracts` instead of fixing only the contracts feature. The problem is cross-cutting, and partial adoption would leave the house pattern unclear for the next feature.

Alternative considered: limit the rename to `contracts`.
Rejected because the repo contract should define one canonical rule for all feature slices.

## Risks / Trade-offs

- Import churn across many files -> Mitigation: keep the change mechanical and scoped to renames without altering validation behavior.
- Short-term merge conflict risk in active feature files -> Mitigation: implement as a focused rename pass with no unrelated refactors.
- Some docs and archived change references will still mention old names -> Mitigation: update canonical implementation docs and the owning active spec; treat archives as historical records unless they are still used as live guidance.

## Migration Plan

- Update the canonical naming rule in the implementation/docs contract.
- Update the `form-validation-boundaries` spec delta to describe the explicit input naming rule.
- Rename form-side schemas and inferred types in all current feature slices.
- Update imports and call sites in hooks, API modules, defaults, and validation utilities.
- Run `pnpm check` and `npx tsc --noEmit` before closing implementation.

## Open Questions

- None. The naming direction is settled: concise read-model names, explicit `Input` write names.
