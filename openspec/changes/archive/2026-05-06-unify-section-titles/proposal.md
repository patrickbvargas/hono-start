## Why

`FormSection` and `EntityDetail.Section` both expose a `title` prop for the same UI role, but they render different typography. This creates avoidable visual drift in equivalent entity form and detail flows and makes shared UI harder to keep consistent.

## What Changes

- Unify shared section-title presentation used by `FormSection` and `EntityDetail.Section`.
- Introduce one shared title primitive for repeated section-heading styling instead of duplicating typography classes.
- Preserve existing section layouts, actions, and descriptions while updating title tone to use spaced uppercase text, muted color, and slightly larger-than-base size.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: equivalent shared entity sections use a consistent section-title treatment across forms and detail drawers.

## Impact

- Affected code: `src/shared/components/form-section.tsx`, `src/shared/components/entity-detail.tsx`, and new shared title primitive under `src/shared/components/`.
- No API, database, auth, or multi-tenant behavior changes.
- Affected users: administrators and regular users see more consistent entity UI across create/edit/detail flows.

## Non-goals

- Redesign section spacing, field grouping, or drawer/modal layout.
- Introduce feature-specific title variants.
- Change pt-BR copy or section titles themselves.
