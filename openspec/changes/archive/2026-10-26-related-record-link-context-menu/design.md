## Context

RelatedRecordLink owns a local overlay and lazily composes six entity detail types. Shared ContextMenu and EntityActions already implement the audit table interaction.

## Goals / Non-Goals

Goals: direct navigation, unchanged primary click, keyboard access, configurable primary action.
Non-goals: collection links, drilldown rows, additional mutation actions.

## Decisions

- Compose existing shared menu primitives and EntityActions at the central link rather than editing consumers individually.
- Keep navigation orchestration in a feature hook, loading public entity search schemas on demand to avoid eager dependency cycles. Preserve the destination drawer's validated collection return context.
- Keep the original button as trigger, support Shift+F10 and ContextMenu, and restore focus on dismissal.
- Coverage validation used temporary green classes; remove them before archive after user approval.
- Context7 is unavailable in this session; inspect installed library declarations and existing tested row-menu implementation as fallback documentation.

## Risks / Trade-offs

- Nested row menus could intercept events → preserve nested control isolation and test it.
- Public feature imports can create cycles → dynamic imports only when navigating.
- Default changes can mislead assistive technology → tooltip and dialog attributes follow the configured primary action.

## Migration Plan

No data migration. Revert link/hook changes to roll back; temporary green classes were removed after coverage review.

## Open Questions

None.

## Follow-up: configurable primary action

RelatedRecordLink accepts primaryAction="summary" | "page". DEFAULT_PRIMARY_ACTION remains summary and provides one place for a future global switch. Explicit menu choices remain unchanged; tooltip and dialog semantics follow the primary action.
