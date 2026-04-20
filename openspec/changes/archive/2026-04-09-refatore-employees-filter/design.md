## Context

The current employees filter already works functionally: `employeeFilterSchema` exposes `name`, `type`, `role`, `status`, and `active`; `getEmployees` applies the search and lookup filters server-side; and `useFilter` persists filter state in URL search params. The remaining issue is presentation. `EmployeeFilter` currently renders the search input, two multiselects, and the active-status control inline inside `Wrapper.Header`, which makes the header dense and scales poorly as more controls are added.

This project standardizes on HeroUI through `src/shared/components/ui/`, so the refactor should use HeroUI primitives instead of custom HTML. HeroUI v3 provides `SearchField` for a first-class search control and `Popover` for interactive, form-like overlay content. TanStack Router already supports URL-driven filter updates through `useSearch` / `useNavigate`, which matches the existing `useFilter` abstraction and should remain the source of truth.

## Goals / Non-Goals

**Goals:**
- Keep the fullname/OAB search visible at all times in the employees header
- Group `type`, `role`, and `active` under a single advanced filters popover trigger
- Preserve the current URL-driven filter behavior, including page reset on filter change
- Stay within the shared UI abstraction by re-exporting any needed HeroUI primitive from `src/shared/components/ui/`
- Keep labels and user-facing copy in Portuguese

**Non-Goals:**
- Changing server-side filter logic or accepted query params
- Introducing new employee filter fields or changing existing labels/meaning
- Reworking table layout, sorting, or pagination
- Adding a dedicated mobile-only filter flow

## Decisions

### 1. Use HeroUI `SearchField` as the always-visible primary control

The `name` filter is the highest-frequency interaction and already maps to a single search term applied against `fullName` and `oabNumber`. HeroUI `SearchField` is a better semantic fit than a generic text input because it provides a search icon, clear affordance, and controlled-value support without custom markup.

The refactor should keep the current debounced submit behavior for this field so URL updates and refetches do not fire on every keystroke. The search control remains outside the advanced popover so users can reach the most common filter without opening an overlay.

Alternative considered:
- Keep using the current generic form input. Rejected because the request explicitly asks for a search-input final state and HeroUI provides a dedicated component for that pattern.

### 2. Use HeroUI `Popover`, not `Dropdown`, for advanced filters

The advanced filter area contains interactive form controls (`Multiselect` and `Autocomplete`), not command-style menu items. HeroUI `Popover` is designed for arbitrary interactive content, while `Dropdown` is a menu abstraction and is less appropriate for embedded filter forms.

Implementation should therefore add a shared `Popover` re-export under `src/shared/components/ui/` and compose the advanced filter trigger/content from there. This keeps feature code compliant with the architecture rule that features do not import HeroUI directly.

Alternative considered:
- Reuse `Dropdown`. Rejected because the content is not a menu and would force an awkward fit for form controls.

### 3. Keep URL search params as the single source of truth, but resync form state from them

The existing `useFilter` hook already updates TanStack Router search params and resets `page` to `1` on filter changes. That should remain unchanged. However, once some controls live in a popover, stale form state becomes more noticeable after browser back/forward navigation, external URL edits, or filter clearing.

The employee filter hook should therefore continue using the current form abstraction but also resync form values whenever parsed URL filter state changes. This keeps the visible search field and popover controls aligned with actual route state.

Alternative considered:
- Let the form keep its initial defaults only. Rejected because URL-driven tables are a project convention, and unsynced overlay controls would violate that model.

### 4. Preserve the current filter semantics and labels

This refactor is strictly presentational. The existing `name`, `type`, `role`, and `active` fields already satisfy the product and data-model requirements, and no new schema or backend changes are needed. The component should keep the same Portuguese labels (`Nome ou OAB`, `Cargo`, `Perfil`, `Status`) and continue to submit through the existing feature hook.

Alternative considered:
- Rename `name` to `search` or restructure the schema. Rejected because it creates unnecessary churn for a UI refactor.

## Risks / Trade-offs

- [Risk] Popover content can drift from URL state after navigation events. -> Mitigation: explicitly resync form state from parsed filter values in the feature hook.
- [Risk] The header could still feel crowded if the trigger and search field are not laid out intentionally. -> Mitigation: design the header row around one primary search field and one secondary trigger, not multiple equal-width controls.
- [Risk] Adding a new shared UI re-export can encourage direct HeroUI usage patterns if done inconsistently. -> Mitigation: follow the existing shared UI wrapper pattern exactly and keep feature imports routed through `@/shared/components/ui`.

## Migration Plan

1. Add the shared `Popover` re-export and barrel entry.
2. Refactor `EmployeeFilter` into a primary search field plus advanced filters trigger/content.
3. Update the employee filter hook to keep form state synchronized with URL filter state.
4. Verify that the employees page still reloads correctly when filters change and that no route/API changes are required.

## Open Questions

- None. The requested behavior is specific enough, and the current codebase already contains the necessary filter fields and URL-driven plumbing.
