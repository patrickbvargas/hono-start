# Frontend

This document defines the reusable frontend house pattern of the repository.

It is meant to survive domain changes as long as the project keeps the same UI architecture.

## Route Model

- Pages live in `src/routes/`.
- Routes compose feature UI and route-level concerns only.
- Route search state is the canonical home for list filters, sorting, and pagination.
- Route files use `createFileRoute` with validated search state and loader prefetching for list screens.
- Route loaders must ensure query data ahead of render rather than letting the page fetch ad hoc.
- The canonical list route shape is the `src/routes/clientes.tsx` flow backed by `src/features/clients`.

## Layout Rules

- Route pages use the wrapper layout system from shared components.
- Entity details open in drawers.
- Create and edit forms open in modals.
- Destructive actions require explicit confirmation UI.
- Entity list pages must be composed with `Wrapper`, `Wrapper.Header`, and `Wrapper.Body`.
- Entity lists are the main entrypoint for operational work.
- Feature UI modules follow the canonical slice pattern in `ARCHITECTURE.md`; nested component re-export barrels are not part of the frontend pattern.

## Form Rules

- Forms are built through the shared app-form pattern and then wrapped by feature-local hooks.
- Feature form hooks are the canonical orchestration layer for create and edit behavior.
- The feature form hook selects the active schema, submits the parsed payload to the feature mutation boundary, refreshes caches, drives toast feedback, and hydrates edit defaults from the detail query when needed.
- Form hook options and component props use explicit local interfaces as defined in `CONVENTIONS.md`.
- Validation errors and helper copy are shown in the product locale defined by the domain or product contract.
- Create and edit flows must share the same feature form component unless a documented exception exists.
- Private child components inside a form are allowed when React hook boundaries require them, such as dependent option loading from a subscribed field value; they must stay feature-local and must not become a second form pattern.

## Table And List Rules

- Lists are server-driven.
- Filtering, sorting, and pagination are URL-driven.
- Empty, loading, and error states must be explicit.
- Stable sorting must be preserved to avoid pagination drift.
- Feature routes with filters must render the filter in the header and the table in the body.
- Overlay state for create, edit, details, delete, and restore must use the shared overlay pattern rather than ad hoc modal state.
- Entity routes must preserve list context while overlays are open.
- The canonical overlay composition is: route-level `useOverlay`, create and edit form modals, delete and restore confirmations, and a details drawer rendered from the route body.
- Loading states use skeleton-style placeholders.
- Empty states use helpful user-facing copy in the product locale.
- Buttons show loading state and become disabled during submission.
- The canonical list-management pattern is:
  - route-level loader with validated search state
  - filter controls in the route header
  - route-consumed list query from the feature barrel
  - server-backed table in the route body
  - create modal
  - edit modal
  - details drawer
  - delete confirmation flow
  - restore confirmation flow
- Equivalent entity tables expose lifecycle authority through `canManageLifecycle` when they show edit, delete, or restore actions.

## shadcn/ui Rules

- shadcn/ui components and prop types are imported through shared UI re-exports only.
- Features must not bind themselves directly to shadcn, Radix, Base UI, or other vendor UI primitives.
- Shared UI modules keep shadcn-style named exports for composed parts such as `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, and `AlertDialogContent`.
- The former migration compatibility layer has been removed; live UI code uses shared UI re-exports.
- UI patterns must remain consistent across entities unless an intentional difference is documented.

## Interaction Contract

- Toasts are the canonical user-feedback mechanism for mutation results.
- Do not use browser-native alerts or confirms for product interactions.
- The UI remains desktop-first but must remain usable on smaller screens.
- Sidebar route labels and user-facing navigation remain in the product locale.
- The route, overlay, loader, and list-management patterns are reusable even when the business domain changes.
- Routes stay declarative: they validate search state, prefetch list data, mount feature UI, and wire overlays, but they do not take over feature mutation or persistence orchestration.
