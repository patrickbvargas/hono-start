## Context

The current table row action UI is structurally duplicated in the entity list tables:

- `src/features/clients/components/table/index.tsx`
- `src/features/employees/components/table/index.tsx`
- `src/features/contracts/components/table/index.tsx`
- `src/features/fees/components/table/index.tsx`
- `src/features/remunerations/components/table/index.tsx`

Each implementation renders a shared UI dropdown trigger with `EllipsisVerticalIcon`, then a menu ordered as view, edit, restore, delete. The differences are the row payload type and feature-owned booleans that decide whether edit, restore, or delete should be shown.

## Goals / Non-Goals

**Goals:**

- Centralize the common entity action dropdown UI in `src/shared/components`.
- Keep feature tables responsible for feature policy, lifecycle predicates, and callback wiring.
- Preserve the existing action labels: `Visualizar`, `Editar`, `Restaurar`, `Excluir`.
- Preserve the existing icons and destructive styling for delete.
- Preserve the existing trigger size, variant, and `aria-label="Ações"`.
- Keep the shared component generic enough to support rows identified by `EntityId` and rows passed as full read models.

**Non-Goals:**

- No new permissions model.
- No new route overlay pattern.
- No generic table column builder.
- No server, database, cache, or mutation changes.

## Decisions

### Use a shared component, not a feature-local helper

The action menu is repeated across several feature slices and uses only generic UI concepts: view, edit, restore, delete. This satisfies the documented extraction rule because the contract is stable across multiple features.

Feature-local code will still own all business decisions. The shared component should receive either precomputed action descriptors or explicit props such as `canView`, `canEdit`, `canRestore`, and `canDelete`.

### Keep row payloads in feature closures

Clients, employees, contracts, and fees call overlays with an `EntityId`, while remunerations currently pass the full `Remuneration` read model. The shared component does not need to know either shape. Feature tables should close over the current row and pass zero-argument callbacks to the shared menu.

Example shape:

```tsx
<EntityActions
	canEdit={!client.isSoftDeleted}
	canRestore={canManageLifecycle && client.isSoftDeleted}
	canDelete={canManageLifecycle && !client.isSoftDeleted}
	onView={() => onView?.(client.id)}
	onEdit={() => onEdit?.(client.id)}
	onRestore={() => onRestore?.(client.id)}
	onDelete={() => onDelete?.(client.id)}
/>
```

### Keep shared UI imports inside the shared component

The new component may import `Button`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, and `DropdownMenuTrigger` from `@/shared/components/ui`. Feature tables should stop importing those dropdown primitives solely for row actions after migration.

This keeps the shadcn/ui boundary intact and reduces repeated lucide icon imports in feature table files.

### Preserve menu behavior by default

The shared component should render only actions with both a callback and a visible predicate. Delete remains visually destructive. Current table behavior hides unavailable actions instead of rendering disabled lifecycle actions, so disabled props are intentionally out of scope.

Recommended action ordering remains:

1. Visualizar
2. Editar
3. Restaurar
4. Excluir

## Risks / Trade-offs

- A too-specific prop API could fail when the next entity needs a custom action. Keep this first extraction focused on the existing four lifecycle actions and allow optional extra actions only if implementation finds an immediate need.
- A too-generic action descriptor API could make common entity menus harder to read. Prefer explicit lifecycle action props unless custom actions are required now.
- Shared code must not absorb feature policy. Contracts and fees still compute their edit availability locally from status and soft-delete state.

## Open Questions

- Should the component name be `EntityActions`, `EntityActionMenu`, or `EntityTableActions`? `EntityActions` is concise, but `EntityTableActions` makes the row-table scope clearer.
- Should the first version support arbitrary extra menu items? Current evidence says no; remuneration export uses a different menu and should remain separate.
