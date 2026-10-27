## 1. Shared record menu composition

- [x] 1.1 Reuse related-record navigation and exact read grants through a public action component; add opt-in context actions to generic Drilldown. No database migration required.

## 2. Surface integration

- [x] 2.1 Add dashboard context/overflow actions with correct record mapping and retained summary behavior.
- [x] 2.2 Add pending-work table/card actions and persistent contextual summaries with tab-aware return navigation.
- [x] 2.3 Add attachment context/overflow parity, disabled downloads and existing deletion confirmation.

## 3. Verification

- [x] 3.1 Update canonical behavior/implementation docs and focused tests for menu parity, permissions, destinations and keyboard/focus behavior.
- [x] 3.2 Run pnpm check, npx tsc --noEmit, relevant tests and build; validate OpenSpec and inspect diff.
## Validation results

- pnpm check and npx tsc --noEmit passed.
- Focused regression: 13 files, 79 tests passed (related-records, drilldown, dashboard/pending/attachment menu integrations, attachment section, pending table, row context menus and feature conventions).
- Production build passed; dependency-level use client bundling warnings remain.
- Strict OpenSpec validation passed.
- Wider pending-work regression: 124 passed, one pre-existing failure in presentation.test.tsx (filters through cards while preserving the other search dimensions). The unchanged PendingWorkSummary component already has a hidden section in HEAD, while this existing test searches for a visible button. Preserve that user-owned behavior; no KPI/card changes are part of this change.
