## Context

The repository contract names shadcn/ui via `@/shared/components/ui` as the fixed UI layer. Current live code still imports the temporary HeroUI compatibility layer from `src/shared/components/Hui` in dashboard, entity forms, entity tables, filters, and an old shared layout file. The package graph also still includes `@heroui/react` and `@heroui/styles`.

This is a cross-cutting frontend cleanup because HeroUI APIs are not one-for-one compatible with the current shadcn/ui-backed shared components. The migration must convert behavior, not just import paths.

## Goals / Non-Goals

**Goals:**

- Remove all live HeroUI and `Hui` imports from application source.
- Preserve existing entity list, action menu, form, filter, dashboard, overlay, and navigation behavior.
- Keep routes and features consuming shared UI only through `@/shared/components/ui` or existing shared composites.
- Add or adjust shared UI components only when an equivalent shadcn/ui-backed export is missing.
- Delete `src/shared/components/Hui` after it has no consumers.
- Remove HeroUI packages from `package.json` and refresh `pnpm-lock.yaml`.
- Verify typecheck and text-search gates prove HeroUI is gone from live source and dependencies.

**Non-Goals:**

- No domain behavior, database, permissions, route search, or server API changes.
- No visual redesign beyond preserving current behavior with the shadcn/ui design system.
- No direct shadcn, Radix, Base UI, or other vendor primitive imports from routes or features.
- No removal of Base UI, Vaul, Sonner, or other dependencies still used by shared shadcn/ui-backed components.

## Decisions

### Use shared UI exports instead of local feature adapters

Features and routes will import from `@/shared/components/ui` and existing shared composites. If a missing behavior is needed repeatedly, it belongs in `src/shared/components/ui` rather than in feature-local wrappers.

Alternative considered: create a new compatibility facade matching the old HeroUI API. Rejected because it would preserve the obsolete API surface and make future code look like HeroUI even after the dependency is removed.

### Convert component APIs explicitly

HeroUI props and compound components will be translated to the current shared UI contracts:

- `Button isIconOnly` becomes icon button sizing such as `size="icon-sm"` or `size="icon"`.
- `isDisabled` becomes `disabled`.
- `onPress` becomes `onClick` for button/menu interactions.
- `Dropdown` compounds become `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, and `DropdownMenuItem`.
- `Tabs` compounds become `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`.
- `Field.Group` becomes `FieldGroup`, with grid/flex classes adjusted to preserve layout.
- HeroUI `Chip` usage becomes `Badge` or a shared status/tone component with supported variants.

Alternative considered: mechanical import rename. Rejected because prop names, event names, variants, and compound structure differ and would leave broken runtime behavior.

### Treat old layout code as removable only after proving it is unused

`src/shared/components/app-layout.tsx` currently imports `Hui`, but the root route uses `AppSidebar` and shared sidebar components instead. If no live imports reference the old layout, remove it rather than migrating dead code.

Alternative considered: migrate all files regardless of reachability. Rejected because preserving dead compatibility code increases maintenance surface.

### Remove dependencies last

HeroUI packages will be removed only after source imports are eliminated and `src/shared/components/Hui` is deleted. This keeps the codebase buildable during the migration and gives clear verification gates.

Alternative considered: remove dependencies first and fix compile errors. Rejected because it produces noisy failures and makes it harder to distinguish intended work from accidental breakage.

## Risks / Trade-offs

- Action menus lose keyboard or focus behavior during conversion -> Use existing shared `DropdownMenu` components and verify table action menus manually or with component tests where practical.
- Form layouts shift because old `Field.Group` was grid-oriented and new `FieldGroup` is flex-oriented -> Preserve explicit grid classes at call sites or add a shared layout utility when repeated.
- Button variants do not map exactly, especially `danger-soft` and loading states -> Use existing `destructive` variant or extend shared button variants intentionally if current UX requires a soft destructive treatment.
- Dashboard tone badges regress because old `Chip` supported `color` and `variant="soft"` -> Map tones to supported `Badge` variants/classes or introduce a shared tone badge component.
- Lockfile cleanup may remove transitive packages unexpectedly -> Use `pnpm install` after editing dependencies and verify `pnpm-lock.yaml` plus build/typecheck.

## Migration Plan

1. Search current live source and package files for `Hui`, `HeroUI`, `heroui`, and `@heroui`.
2. Migrate simple imports first: filters using `Separator`, forms using `Field.Group`, dashboard cards/badges.
3. Migrate repeated table action menus across clients, employees, contracts, fees, and remunerations to shared `DropdownMenu` patterns.
4. Migrate the contract form tabs and dynamic-row buttons to shared tabs/buttons while preserving validation indicators and disabled states.
5. Remove or migrate `src/shared/components/app-layout.tsx` after confirming reachability.
6. Delete `src/shared/components/Hui`.
7. Remove `@heroui/react` and `@heroui/styles` from package dependencies and refresh `pnpm-lock.yaml`.
8. Run verification: typecheck, lint/check if available, and source/package text searches proving HeroUI is absent from live code.

Rollback strategy: keep changes grouped so the package removal and `Hui` folder deletion can be reverted independently from source migrations if an unexpected UI behavior regression appears.

## Open Questions

- Should shared UI add a reusable tone badge/status badge component for `success`, `warning`, `danger`, and `default`, or should each caller map those tones locally? Fix to use the native shadncn ui variants
- Should shared `Button` gain a first-class loading/pending state, or should pending buttons compose a spinner locally? Locally
