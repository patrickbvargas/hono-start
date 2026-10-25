## Context

Existing routes share wrappers, overlays, feature-owned hooks and protected query factories. The current contract drawer already permits contextual receipt creation. Dashboard data already includes scoped overdue installments. Preserve these boundaries.

## Goals / Non-Goals

Goals: a navigable contract workspace, visible next actions, consistent receipt vocabulary and transparent remuneration review. Non-goals are defined in the proposal; this change does not invent financial or account-administration APIs.

## Decisions

- Keep list routes and quick drawers. Add /contratos/$contractId as a sibling leaf route (underscore suffix prevents nesting under the list) with URL-owned tab and a validated return-list search context. Reuse protected detail queries and existing mutation forms.
- Build the workspace inside contracts; share revenue presentation/access eligibility between drawer and workspace rather than creating another permission model. Show authorized receipt/remuneration collection links; history uses exact entity identity in audit search.
- Retain a default-hidden optional panel using dashboard's existing overdue payload, clearly labeled as selected scope and capped preview; do not imply a new global count or future-values aggregation. Open the workspace finance tab from each task.
- Keep financial ledger naming and URLs unchanged internally; label the received-event pages Recebimentos. Preserve planned honorários terminology in analytics.
- Settings uses existing account dialog and theme preference, readonly office context and an actionable workflow guide. No fake editable company or invitation controls.
- Invalid submissions use shared form context subscription and the actual dialog DOM, including controls in portals; automatically expand contract invalid revenue rows before focusing. Remove direct Submit onClick dispatch to avoid duplicate native submissions.
- No new library. Context7 tooling is unavailable in this session; inspect existing shared component APIs and installed types, then validate TypeScript and browser behavior.

## Risks / Trade-offs

- Financial amounts may be sensitive: preserve existing access-resource checks and do not fetch additional restricted collections for the workspace.
- Audit text matching is ambiguous: add an optional exact entityId filter alongside entityType, enforced in query and schema.
- Calendar boundaries and dashboard pagination: reuse reference timestamps and expose preview scope explicitly.
- Generated route types: let the existing router plugin regenerate the route tree.

## Migration Plan

No database migration. Ship additive routes and backwards-compatible optional audit filtering. Roll back UI changes without data transformation.
