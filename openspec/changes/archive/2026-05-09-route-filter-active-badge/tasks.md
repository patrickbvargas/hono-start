## 1. Shared filter-state support

- [x] 1.1 Add shared helper support in `useFilter` to detect non-default route-filter values from the validated schema output.
- [x] 1.2 Extend `FilterPopover` with optional active-indicator props and render the visual badge without changing existing default usage.

## 2. Route filter integration

- [x] 2.1 Wire the active-indicator behavior into entity filter surfaces that use `FilterPopover`, including clients, employees, contracts, fees, remunerations, and audit logs.
- [x] 2.2 Wire the active-indicator behavior into the dashboard advanced filters while excluding inline-only controls from the indicator scope.

## 3. Verification

- [x] 3.1 Add focused Vitest coverage for the shared non-default filter detection and indicator behavior.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, fix any issues, and confirm the change is ready without DB migrations.
