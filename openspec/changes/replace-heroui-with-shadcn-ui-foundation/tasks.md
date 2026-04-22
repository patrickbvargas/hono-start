## 1. Contract And Docs

- [x] 1.1 Update `docs/implementation/STACK.md` to make shadcn/ui the fixed shared UI component layer.
- [x] 1.2 Update `docs/implementation/CONVENTIONS.md` so features and routes consume `@/shared/components/ui` and avoid direct vendor UI imports.
- [x] 1.3 Update `docs/implementation/FRONTEND.md` to replace HeroUI-specific rules with shadcn/ui shared-layer rules.
- [x] 1.4 Confirm no domain docs need changes because this is presentational infrastructure only.

## 2. Documentation Lookup

- [x] 2.1 Use Context7 or official shadcn/ui documentation before implementation to confirm current CLI commands, component names, and generated file patterns.
- [x] 2.2 Record any shadcn component gaps that require local shared composites.

## 3. shadcn/ui Installation

- [x] 3.1 Use the existing `components.json` configuration and generate direct shadcn/ui correspondents for the current `src/shared/components/Hui` inventory.
- [x] 3.2 Add required supporting dependencies only when the generated shadcn components need them.
- [x] 3.3 Keep generated code under `src/shared/components/ui` and supporting utilities under documented shared paths.

## 4. Shared UI Export Shape

- [x] 4.1 Add shared component modules/barrels under `src/shared/components/ui`.
- [x] 4.2 Export shadcn-style direct named components for each installed primitive.
- [x] 4.3 Preserve shadcn/ui named export conventions for composed components, including `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, and `AlertDialogContent`.
- [ ] 4.4 Add local shared composites for HeroUI surface gaps such as autocomplete, combobox, chip, date-field, field, link, list-box, number-field, search-field, spinner, tag-group, and text-field when no direct shadcn component exists.
- [x] 4.5 Keep `src/shared/components/Hui` as a temporary compatibility layer if needed for existing imports, but have it delegate toward `ui` where practical.

## 5. Verification

- [x] 5.1 Run `pnpm check`.
- [x] 5.2 Fix all Biome formatting, lint, and import-order issues introduced by generated or wrapper component code.
- [x] 5.3 Run `npx tsc --noEmit`.
- [x] 5.4 Fix all TypeScript errors introduced by the shared UI foundation.
- [x] 5.5 Search for unintended new direct `@heroui/*` imports outside the compatibility layer.
- [x] 5.6 Verify representative shadcn-native named exports compile, including `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, and `AlertDialogContent`.

## Notes

- DB migrations required: No.
- User-facing behavior changes intended: No.
- Full feature-screen migration required in this change: No.
- shadcn CLI confirmed `date-picker` is not available for the configured `base-nova` registry style; date picker remains a gap.
- Current gaps still requiring non-HeroUI local composites: autocomplete, combobox, chip, date-field/date-picker, field, link, list-box, number-field, search-field, spinner, tag-group, text-field, plus old compound overlay/table/tab compatibility.
