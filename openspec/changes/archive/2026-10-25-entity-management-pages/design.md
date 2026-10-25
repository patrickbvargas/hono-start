## Context

ContractWorkspace establishes the reference layout and thin dynamic route. Other collections already have protected detail queries, Zod read models, lifecycle helpers, forms and drawers. Shared UI is consumed exclusively through its public exports. Context7 is unavailable in this environment; existing repository implementations and installed type definitions are the integration reference, supplemented by official library documentation if needed.

## Goals / Non-Goals

**Goals:** Provide predictable full-page record management for the team, preserve related-record inspection and existing permissions, and retain collection state across navigation.

**Non-Goals:** No schema migrations, permission changes, financial recalculation changes, speculative prefetch, new form stack or global entity registry.

## Decisions

- Each affected feature owns a workspace component, orchestration hook and Zod search schema. Routes validate numeric identifiers, load the existing protected query and compose the workspace, following contracts.
- A small shared EntityWorkspace presentation shell repeats the proven contract layout: application heading, visible permitted actions, return link, record identity/status and URL-controlled tabs. Domain data, tabs, permission checks and mutations remain in the feature.
- Extract page-compatible detail content within each feature so page overview and drawers display the same fields and relationship links without rendering drawer primitives in a page. Attachments move to a dedicated workspace tab, retaining compact lists in drawers. Existing business history is mounted only in its tab.
- Tables and mobile cards receive onOpenPage alongside onView, mirroring contracts. Primary triggers prefer onOpenPage; menus explicitly expose both page navigation and optional drawer inspection. Legacy detailId URLs remain valid and excluded from list query identity.
- Feature search schemas validate tab and returnTo using their own list schema. No arbitrary return URL is accepted. Page deletion returns to the validated collection state; edits and restores stay on the page and use existing invalidation.
- Include audit log pages as read-only workspaces. Audit history inside another record keeps its contextual drawer; immutable audit entries have no lifecycle controls.

## Risks / Trade-offs

- Repeated page/drawer fields drift → share feature-owned content and test page rendering without drawer context.
- Hidden resource states expose actions → retain existing lifecycle predicates plus explicit Clerk checks; server operations remain authoritative.
- Mobile headings overflow → responsive action rows, wrapping identity, horizontally scrollable tabs and internally scrolling attachments; inspect real browser geometry.
- Back-navigation loses filters → typed, validated returnTo and explicit dynamic destination when changing tabs; test invalid input and restored list context.
- Audit history wording assumes contracts → generalize empty feedback to records.

## Migration Plan

Deploy route and feature changes together; preserve existing list/detailId URLs. No data migration. Rollback application changes to restore drawer-first list navigation without affecting stored records.

## Open Questions

None. Audit logs are included for navigation consistency, with read-only behavior.

## Visual review refinement

Contracts also use EntityWorkspace, including identical application-header action placement and labels. The shell owns content width and spacing. Status appears only in the page header. Registration dates sit in history above scoped audit events. Clients separate contact information; employees, fees and remunerations separate financial data. Expenses keep their short payment record together rather than adding a sparse financial tab. Audit entries separate summary, changes and technical payload. Existing drawers retain their complete compact presentation. Tab counts follow actual entity content rather than adding irrelevant contract tabs to every entity.

## Related collections and alerts refinement

Receipt remuneration navigation adds an optional exact feeId to the existing filter schema and shared data where-builder; list totals and export inherit the same scope. The receipt count represents non-deleted remunerations independent of active state, so its link uses the existing all-active/non-deleted defaults. Own-only readers use a textual own-scope link. Employee financial navigation is hidden for another employee under own-only grants.

Client/employee alert previews reuse pending-work with exact existing clientId/employeeId filters, limit five and fixed severity ordering. The wrapper gates query mounting with independent contract and fee grants; server scope remains authoritative. Preview summaries cover the full authorized collection, with a filtered link for all rows and contextual contract drawers for inspection. No database migration, new alert rules, per-contract queries or route pagination coupling.

The shared shell keeps identity, ID and status in one responsive row. Lifecycle buttons use the application header action slot. Wrapper overflow stays hidden; tabs consume remaining height and ordinary panels scroll internally. Expanded attachments keep their nested scrolling. Remuneration finance omits the two reviewed explanatory paragraphs.

Client/employee overviews use expanded flex layouts: general fields stay above a flexible alert section, whose shared ScrollArea consumes remaining height. A minimum alert height and outer overflow fallback preserve access in exceptionally short viewports. Compact record identity includes vertical padding and wider inline gaps.
