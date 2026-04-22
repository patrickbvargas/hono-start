## Context

The current contract says:

- shared UI components are consumed through `@/shared/components/ui`
- direct `@heroui/*` imports are forbidden in features or routes
- `docs/implementation/STACK.md` still names HeroUI as the fixed UI component library

The current code still has the practical HeroUI wrapper surface at `src/shared/components/Hui`, including primitives such as button, card, table, modal, drawer, inputs, forms, overlay components, tags/chips, tabs, toast, tooltip, and date-related controls.

The target is a staged migration:

```text
features/routes
      |
      v
@/shared/components/ui
      |
      v
shadcn/ui primitives + local shared composites
```

This keeps the vendor swap contained in shared UI while preserving the existing feature-slice architecture.

## Goals / Non-Goals

**Goals:**

- Generate or add shadcn/ui components that correspond to the existing `Hui` component inventory.
- Create `src/shared/components/ui` as the canonical shared UI package for future imports.
- Preserve shadcn/ui's normal named export style from shared component modules.
- Keep generated shadcn code Biome-clean under the repository rules.
- Update the implementation docs so shadcn/ui is the documented shared UI layer.

**Non-Goals:**

- Complete the full application migration from HeroUI to shadcn/ui.
- Guarantee perfect prop-level compatibility with every HeroUI prop.
- Preserve HeroUI-specific behaviors that shadcn/ui does not support naturally.
- Change domain behavior, permissions, data access, or route workflows.

## Component Coverage Strategy

Classify the current `Hui` files into three groups.

| Current `Hui` surface | shadcn/ui strategy |
|---|---|
| `button`, `card`, `input`, `input-otp`, `label`, `separator`, `skeleton`, `switch`, `table`, `tabs`, `tooltip` | Direct shadcn/ui primitives with shadcn-native named exports |
| `alert-dialog`, `drawer`, `dropdown`, `form`, `modal`, `pagination`, `popover`, `radio-group`, `calendar`, `date-picker`, `toast`, `text-area` | Direct shadcn/ui primitives, usually with local barrel normalization |
| `autocomplete`, `combobox`, `chip`, `date-field`, `field`, `link`, `list-box`, `number-field`, `search-field`, `spinner`, `tag-group`, `text-field`, `empty-state`, `sidebar-nav` | Local shared composites built from shadcn/ui primitives, Radix-backed shadcn primitives, native elements, or existing shared code |

The implementation should install direct shadcn components first, then add local composites only for gaps needed to match the `Hui` inventory.

## Export Shape Decision

Each shared UI module should keep shadcn/ui's normal named exports. Do not add HeroUI-like compound aliases such as `Table.Header`, `Card.Header`, or `Tabs.List`.

Example target shape:

```tsx
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
```

Use the same shadcn-native pattern for components with composition parts such as `Card`, `AlertDialog`, `Dropdown`, `Drawer`, `Form`, `Modal/Dialog`, `Popover`, `RadioGroup`, `Tabs`, and `Tooltip`.

For components that are local composites rather than generated shadcn components, prefer named exports that match shadcn's style and avoid dot-property composition.

## Import Boundary Decision

Features and routes should consume shared UI from `@/shared/components/ui`. The older `src/shared/components/Hui` layer may temporarily re-export from `ui` during migration, but it should become a compatibility layer only. New feature work should not add new imports from `Hui`.

## Documentation Decision

The implementation contract must be updated in the same implementation pass:

- `STACK.md`: replace "HeroUI via shared re-exports only" with "shadcn/ui via shared re-exports only".
- `CONVENTIONS.md`: update forbidden direct-vendor import rules from `@heroui/*` to direct shadcn/Radix vendor imports outside shared UI, while allowing shadcn generated internals under `src/shared/components/ui`.
- `FRONTEND.md`: replace the HeroUI rules section with shared shadcn/ui rules and preserve the route/list/modal/drawer interaction contract.

## Validation Plan

- Run shadcn CLI installation/generation using the existing `components.json`.
- Run `pnpm check` and fix all Biome issues.
- Run `npx tsc --noEmit` after component wrappers are in place.
- Inspect exports for shadcn-native named components such as `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, `AlertDialogContent`, and `DropdownMenuItem`.
- Search for new direct `@heroui/*` imports outside the compatibility layer.

## Risks / Trade-offs

- [Risk] shadcn/ui does not have exact equivalents for several HeroUI components. Mitigation: build small shared composites only in `src/shared/components/ui`, and do not promise prop-level HeroUI compatibility.
- [Risk] generated shadcn components may not be Biome-clean by default. Mitigation: run `pnpm check` and make mechanical lint fixes in the same pass.
- [Risk] existing HeroUI-style consumers may expect dot-property composition. Mitigation: this foundation intentionally keeps shadcn exports native; feature migration tasks must update call sites to named shadcn components as they move off `Hui`.
- [Risk] updating the stack contract before all feature imports migrate creates a transition period. Mitigation: keep `Hui` as a temporary compatibility layer until feature migration is complete.

## Open Questions

- Should the final migration delete `src/shared/components/Hui`, or keep it as a deprecated compatibility barrel for one additional change?
- Should `Dialog` be exposed under shadcn's native `Dialog*` names only, or should shared UI also export `Modal*` aliases during migration?
- Should `Chip` map to `Badge`, or should it be a local removable tag-style component?
