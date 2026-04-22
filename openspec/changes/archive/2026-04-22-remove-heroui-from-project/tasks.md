## 1. Inventory And Shared UI Gaps

- [x] 1.1 Use Context7 MCP or official shadcn/ui docs for any shared UI component behavior that is unclear before implementation.
- [x] 1.2 Search live source and package files for `Hui`, `HeroUI`, `heroui`, and `@heroui`; record every live consumer that must be migrated.
- [x] 1.3 Compare required HeroUI behaviors against current `src/shared/components/ui` exports and identify missing shared components, variants, or composition helpers.
- [x] 1.4 Confirm whether `src/shared/components/app-layout.tsx` is unreachable; plan deletion if no live import references it.

## 2. Shared UI Support

- [x] 2.1 Add or adjust shared UI exports needed to replace HeroUI usage without direct vendor imports from routes or features.
- [x] 2.2 Decide and implement the shared pattern for tone/status badges used by dashboard and entity status displays.
- [x] 2.3 Decide and implement the shared pattern for pending/loading buttons if existing HeroUI `isPending` behavior must be preserved.
- [x] 2.4 Ensure shared UI component variants cover destructive and icon-only actions used by entity tables and dynamic forms.

## 3. Feature And Shared Source Migration

- [x] 3.1 Migrate dashboard `Card` and `Chip` usage to shared shadcn/ui-backed components while preserving content and tone indicators.
- [x] 3.2 Migrate clients, employees, fees, remunerations, and contracts form layouts from `Field.Group` to shared `FieldGroup` or equivalent shared layout components.
- [x] 3.3 Migrate contracts and remunerations filters from `Hui` separators to `@/shared/components/ui`.
- [x] 3.4 Migrate clients, employees, contracts, fees, and remunerations table action menus from HeroUI `Dropdown` to shared dropdown menu components.
- [x] 3.5 Migrate remuneration export menu from HeroUI dropdown/button props to shared UI equivalents.
- [x] 3.6 Migrate contract tabbed form sections from HeroUI `Tabs` to shared tabs while preserving selected tab state and validation indicators.
- [x] 3.7 Migrate contract dynamic assignment and revenue row buttons from HeroUI button props to shared button props.
- [x] 3.8 Remove `src/shared/components/app-layout.tsx` and related old sidebar-nav compatibility code if confirmed unreachable; otherwise migrate it to shared UI.

## 4. Remove HeroUI Compatibility And Dependencies

- [x] 4.1 Run a live-source search proving no files outside `src/shared/components/Hui` import or depend on `Hui`.
- [x] 4.2 Delete `src/shared/components/Hui`.
- [x] 4.3 Remove `@heroui/react` and `@heroui/styles` from `package.json`.
- [x] 4.4 Refresh `pnpm-lock.yaml` with pnpm so HeroUI packages leave the lockfile.
- [x] 4.5 Update live docs that describe `src/shared/components/Hui` as a temporary migration layer so they reflect the completed cleanup.

## 5. Verification

- [x] 5.1 Run `rg -n "Hui|HeroUI|heroui|@heroui" src package.json pnpm-lock.yaml docs openspec/specs` and verify remaining matches are only archived historical context or the active change artifacts.
- [x] 5.2 Run `pnpm check` and fix all reported issues.
- [x] 5.3 Run `npx tsc --noEmit` or `pnpm exec tsc -p tsconfig.json --noEmit` and fix all reported issues.
- [x] 5.4 Run relevant app smoke checks for dashboard, entity tables, filters, create/edit forms, contract tabs, and remuneration export menu.
- [x] 5.5 Run `openspec validate remove-heroui-from-project --strict`.

## 6. Database

- [x] 6.1 Confirm no database migration is required because this is a frontend dependency cleanup only.
