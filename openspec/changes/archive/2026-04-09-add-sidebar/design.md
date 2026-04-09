## Context

The app is a TanStack Start SPA with TanStack Router for file-based routing. Currently `__root.tsx` renders `{children}` with no persistent shell — there is no application chrome. Users have no way to navigate between routes.

The UI library is HeroUI (re-exported from `@/shared/components/ui`). A `Drawer` component and a `ListBox` component already exist as re-exports. TanStack Router's `useRouterState` and `Link` are available for active-route detection and navigation.

The app uses Tailwind CSS. The `container` class is the standard way to establish max-width breakpoints in this project.

## Goals / Non-Goals

**Goals:**
- Render a collapsible sidebar on desktop containing all `ROUTES` as navigable items via HeroUI `ListBox`.
- On mobile, replace the persistent sidebar with a slide-in `Drawer` (left placement) triggered by a hamburger button.
- Wrap sidebar + content inside a `container` element to apply Tailwind breakpoints.
- Active route item is highlighted automatically using `useRouterState`.
- Sidebar collapse/expand state is local UI state (not URL-driven, not persisted).

**Non-Goals:**
- Route-level authentication or access control.
- Nested/hierarchical route sections (all routes are flat for now).
- Persisting sidebar open/collapsed preference across sessions.
- A top navigation bar (header) — out of scope for this change.

## Decisions

### 1. Component location: `shared/components/ui/`

All new layout components (`AppLayout`, `SidebarNav`) go into `src/shared/components/` to match the architecture convention. `AppLayout` is a composite layout component, not a feature — it belongs in `shared`.

`SidebarNav` wraps HeroUI `ListBox` — therefore it lives in `src/shared/components/ui/` following the UI abstraction rule: re-export from `@/shared/components/ui/`, never import HeroUI directly in features or routes.

### 2. Sidebar state: local React state in `AppLayout`

Collapse state (`isCollapsed`) and mobile drawer open state (`isDrawerOpen`) are both local `useState` in `AppLayout`. These are pure UI concerns with no routing or server implications. Persisting them (e.g., in `localStorage`) would add complexity without meaningful UX gain for this use case.

### 3. Mobile detection: Tailwind responsive classes + conditional rendering

Rather than a JS-based media query hook, the sidebar uses CSS visibility (`hidden md:flex` / `flex md:hidden`) to show/hide the desktop sidebar vs. the mobile drawer trigger. This is simpler, avoids hydration mismatches in SSR, and keeps the component tree clean.

The mobile `Drawer` is always in the DOM but only `isOpen` when the user taps the hamburger button.

### 4. Active route detection: `useRouterState`

The active item is determined by comparing `router.location.pathname` against each route's `url`. This is the idiomatic TanStack Router approach without requiring custom hooks.

### 5. Navigation: HeroUI `ListBox` with `Link` as item renderer

Each `ListBox.Item` renders a TanStack Router `Link` as its child. This gives full keyboard accessibility (arrow keys, Enter) from HeroUI plus router-aware navigation from TanStack. No custom click handlers needed.

### 6. Container breakpoints

`AppLayout` renders a root `<div>` with `container mx-auto` (Tailwind). Inside: a `flex` row of `[sidebar] [main content]`. This respects the project's convention for layout breakpoints.

## Risks / Trade-offs

- **SSR flash on hydration**: If sidebar collapse state were stored in `localStorage`, there could be a hydration mismatch. By using pure `useState` (default open on desktop, closed on mobile), this risk is eliminated.
- **ListBox as navigation**: HeroUI `ListBox` is designed for selection, not navigation. Using `Link` as item content is unconventional but maintains accessibility — keyboard users can navigate items and press Enter to follow the link.
- **No top header in this change**: A hamburger button needs to live somewhere visible on mobile. It will be rendered inline inside `AppLayout`'s mobile header bar. A proper top `Header` component can be added in a follow-up change.
