## Why

The app currently has no persistent navigation — users have no way to move between modules (Clientes, Contratos, Honorários, etc.) without manually typing URLs. A sidebar provides the primary navigation structure that every authenticated page needs.

## What Changes

- New `Sidebar` component backed by HeroUI `ListBox` for accessible, keyboard-navigable route links.
- Sidebar is collapsible on desktop (icon-only collapsed state) and renders as a HeroUI `Drawer` on mobile.
- A new `AppLayout` container component wraps the sidebar and main content area inside a Tailwind `container` class to manage breakpoints.
- The root route shell (`__root.tsx`) will be updated to render `AppLayout` around `<Outlet />`.

## Capabilities

### New Capabilities

- `app-layout`: Container layout component that composes the collapsible sidebar + main content area. Handles responsive breakpoints via Tailwind `container` class, desktop collapse state, and mobile drawer state.
- `sidebar-nav`: The sidebar navigation component using HeroUI `ListBox`. Renders `ROUTES` from `src/shared/config/routes.ts` as list items with icon + label. Highlights the active route. Supports collapsed (icon-only) mode.

### Modified Capabilities

<!-- No existing specs change behavioral requirements -->

## Impact

- `src/routes/__root.tsx` — integrate `AppLayout` into `RootDocument`
- `src/shared/components/ui/` — new `AppLayout` and `SidebarNav` components
- `src/shared/config/routes.ts` — consumed as-is; no changes needed
- New dependency: none (HeroUI `ListBox` and `Drawer` already available; `@tanstack/react-router`'s `useRouterState`/`Link` already in use)
