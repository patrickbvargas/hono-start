## 1. Workspace contract

- [x] 1.1 Update canonical documentation for page-first navigation, contextual drawers and feature-owned workspaces. No database migrations required.
- [x] 1.2 Add feature-owned workspace search schemas and shared presentation following contracts.

## 2. Feature workspaces

- [x] 2.1 Share page-compatible overview content with existing feature detail drawers.
- [x] 2.2 Implement workspace hooks, components and thin protected detail routes for clients, employees, fees, expenses and remunerations.
- [x] 2.3 Implement read-only audit workspace and preserve contextual audit inspection.
- [x] 2.4 Update desktop tables and mobile lists with default page navigation and explicit menu actions, preserving drawers and return state.

## 3. Validation

- [x] 3.1 Add focused tests for workspace URL validation, lifecycle permissions, page rendering and collection navigation.
- [x] 3.2 Run pnpm check, npx tsc --noEmit, focused/full Vitest checks and production build; fix failures and inspect conventions.
- [x] 3.3 Inspect desktop/mobile pages and contextual overlays in a real browser; record results and limitations.

## 4. Visual consistency review

- [x] 4.1 Move contracts onto the same workspace shell and align identity, status, actions, spacing and content width across every record page.
- [x] 4.2 Separate meaningful contact/financial/audit content into addressable tabs and keep registration dates in history without duplicating header state. Preserve complete drawers.
- [x] 4.3 Test revised content ownership, URL tabs, consistent actions and drawer preservation; inspect every page and mobile layouts, update docs and rerun checks.

## 5. Related collections and contract alerts

- [x] 5.1 Add exact receipt filtering to remuneration lists, totals and exports, with visible removable scope and permission-aware links from receipts and employees.
- [x] 5.2 Embed authorized contract-alert previews scoped by persisted client/employee IDs, reusing the pending-work query and contextual contract drawers.
- [x] 5.3 Cover scope, permissions, loading/error/empty states and navigation; update docs and verify the result.

## 6. Compact workspace chrome

- [x] 6.1 Place lifecycle actions in the shared page header, compact identity/ID/status onto one responsive row and confine scrolling to full-height tab panels.
- [x] 6.2 Remove the two marked remuneration page paragraphs and verify desktop/mobile geometry, scrolling, action callbacks and final checks.

## 7. Workspace spacing and alert scrolling
- [x] 7.1 Add vertical breathing room to compact record identity while retaining one-line layout.
- [x] 7.2 Let client/employee overviews fill tab height and give contract-alert lists their own shared ScrollArea, preserving permissions, states and links.
