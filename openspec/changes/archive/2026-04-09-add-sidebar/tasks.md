## 1. SidebarNav Component

- [x] 1.1 Create `src/shared/components/ui/sidebar-nav.tsx` — export `SidebarNav` component with `isCollapsed` prop that renders HeroUI `ListBox` with all `ROUTES` entries
- [x] 1.2 Implement active route detection using `useRouterState` to compare `router.location.pathname` with each route's `url`; pass the matching key as `selectedKeys` to `ListBox`
- [x] 1.3 Render each `ListBox.Item` with a TanStack Router `Link` child, showing the Lucide icon and title label
- [x] 1.4 Implement collapsed mode: when `isCollapsed={true}`, hide the label text and show only the icon (use Tailwind `hidden`/`sr-only` pattern)
- [x] 1.5 Re-export `SidebarNav` and its props from `src/shared/components/ui/index.ts` (or the relevant barrel)

## 2. AppLayout Component

- [x] 2.1 Create `src/shared/components/app-layout.tsx` — export `AppLayout` component with local state for `isCollapsed` (desktop) and `isDrawerOpen` (mobile)
- [x] 2.2 Render a `container mx-auto` root div with a flex row: sidebar column + main content column (`flex-1 overflow-auto`)
- [x] 2.3 Add desktop sidebar panel (`hidden md:flex flex-col`) containing `SidebarNav` and the collapse toggle button
- [x] 2.4 Add mobile header bar (`flex md:hidden`) with a hamburger `Button` (icon-only) that sets `isDrawerOpen = true`
- [x] 2.5 Add HeroUI `Drawer` (placement `left`) controlled by `isDrawerOpen` / `onOpenChange`; render `SidebarNav` inside `Drawer.Body`; close drawer on item selection via `onAction` callback passed down
- [x] 2.6 Export `AppLayout` from `src/shared/components/app-layout.tsx` as a named export

## 3. Root Route Integration

- [x] 3.1 Import `AppLayout` in `src/routes/__root.tsx` and wrap the `{children}` render inside `RootDocument` with `<AppLayout>{children}</AppLayout>`

## 4. Validation

- [x] 4.1 Run `pnpm check` and fix all formatting/lint errors reported by Biome
- [x] 4.2 Run `npx tsc --noEmit` and fix all TypeScript errors before marking done
