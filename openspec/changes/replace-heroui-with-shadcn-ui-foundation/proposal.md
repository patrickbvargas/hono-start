## Why

The project currently documents HeroUI as the fixed shared UI layer and exposes HeroUI primitives through `src/shared/components/Hui`. The desired direction is to replace HeroUI with shadcn/ui while keeping feature and route code insulated from vendor-specific imports.

This change creates the shadcn/ui foundation needed before migrating feature screens: install the shadcn/ui components corresponding to the current `Hui` surface and expose them from `src/shared/components/ui` using shadcn/ui's normal named export style.

## What Changes

- Update the implementation contract so the shared UI component layer is shadcn/ui instead of HeroUI.
- Install or generate the shadcn/ui primitives needed to cover the current `src/shared/components/Hui` component surface.
- Add shared wrapper exports under `src/shared/components/ui`.
- Keep component exports aligned with shadcn/ui conventions rather than adding HeroUI-like compound aliases.
- Keep existing product feature behavior unchanged; this is a migration foundation, not a feature-screen rewrite.
- Run Biome and fix lint/format issues introduced by generated or wrapper component code.

## Capabilities

### New Capabilities

- `shared-ui-components`: define the shared shadcn/ui component foundation, component coverage expectations, shadcn-native export style, import boundaries, and verification requirements.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/shared/components/ui`, `src/shared/components/Hui`, shared UI import barrels, shadcn generated component files, and supporting utilities such as `src/shared/lib/utils` if required by shadcn/ui.
- Affected docs/specs: `docs/implementation/STACK.md`, `docs/implementation/CONVENTIONS.md`, `docs/implementation/FRONTEND.md`, and the new `openspec/specs/shared-ui-components/spec.md`.
- Affected roles: developers and reviewers maintaining shared UI and future screen migrations.
- Multi-tenant impact: none intended; this change is presentational infrastructure only and must not alter tenant scope, permissions, or business behavior.

## Non-goals

- Do not migrate feature screens or routes from `Hui` imports in this first foundation step unless required to keep the build/lint clean.
- Do not remove HeroUI dependencies until no application code depends on the old `Hui` layer.
- Do not redesign product workflows, route composition, forms, tables, modals, drawers, or pt-BR copy.
- Do not introduce a second UI import path for features; shared UI consumption remains centralized.
- Do not add database migrations.
