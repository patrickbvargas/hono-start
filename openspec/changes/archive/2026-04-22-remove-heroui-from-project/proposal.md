## Why

The project contract now defines shadcn/ui through `@/shared/components/ui` as the canonical UI layer, but live code still depends on the temporary `src/shared/components/Hui` compatibility layer and HeroUI packages. Removing HeroUI finishes the migration and prevents future feature work from relying on obsolete vendor APIs.

## What Changes

- Replace all live imports from `@/shared/components/Hui` and `src/shared/components/Hui` with `@/shared/components/ui` or existing shared composites.
- Add or adjust shared shadcn/ui-backed components only when required to preserve current UI behavior.
- Remove the `src/shared/components/Hui` compatibility folder after no live imports remain.
- Remove `@heroui/react` and `@heroui/styles` from `package.json` and refresh the lockfile.
- Verify there are no remaining live `HeroUI`, `heroui`, `@heroui`, or `Hui` references outside archived/history files and intentional documentation notes.
- Preserve existing route, feature, form, table, overlay, filter, dashboard, and sidebar behavior while changing the underlying UI primitives.

## Capabilities

### New Capabilities

- `shared-ui-vendor-boundary`: Defines the shared UI import boundary and the requirement that live app code must not depend on HeroUI after the cleanup.

### Modified Capabilities

- None.

## Impact

- Affected code: shared UI primitives/composites, dashboard components, entity forms, entity tables, filters, and any unused legacy layout files still importing `Hui`.
- Affected dependencies: remove HeroUI runtime/style packages from the pnpm dependency graph.
- Affected APIs: no route, server, database, or domain API changes intended.
- Affected roles: all application users should see the same workflows with shadcn/ui-backed controls.
- Multi-tenant impact: none; this is a frontend dependency and shared UI cleanup.

## Non-goals

- Do not change domain behavior, permissions, data access, route search behavior, or business rules.
- Do not redesign screens beyond the minimum needed to preserve behavior with shadcn/ui-backed components.
- Do not introduce direct vendor UI imports from routes or features.
- Do not remove Base UI or other current shadcn-backed implementation dependencies that shared UI components still use.
