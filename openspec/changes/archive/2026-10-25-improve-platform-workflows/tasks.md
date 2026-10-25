## 1. Platform navigation
- [x] 1.1 Group sidebar and align receipt vocabulary without URL changes.
- [x] 1.2 Add settings using existing preferences and account controls.

## 2. Connected contract work
- [x] 2.1 Add validated workspace route, tabs and preserved return context.
- [x] 2.2 Reuse authorized contextual receipt creation and financial links.
- [x] 2.3 Add exact contract audit filtering (no DB migration required).

## 3. Daily usability
- [x] 3.1 Retain scoped overdue dashboard preview with workspace links, hidden by default after user review.
- [x] 3.2 Add stored remuneration explanation and manual-adjustment guidance.
- [x] 3.3 Add shared invalid-submit feedback/focus and keep dependent field guidance.

## 4. Verification
- [x] 4.1 Add focused behavior and boundary coverage; update canonical documentation.
- [x] 4.2 Run Biome, TypeScript, tests and OpenSpec validation; verify desktop and narrow-screen browser flows.

## Verification evidence

- Full Vitest suite: 158 files, 667 tests passed with host filesystem support for the existing hard-link storage tests.
- After user feedback: 6 focused files, 30 tests passed; default-hidden preview assertion included.
- Biome and TypeScript passed; strict OpenSpec validation passed.
- Production build passed; dependency bundling emitted module-level use-client directive warnings.
- Browser: protected workspace tabs, prefilled receipt and invalid-focus flow, exact audit filtering/clear, period shortcut and remuneration explanation checked without creating financial records. Desktop drawer entry confirmed in header; at 390x650 the single visible link was in the body. Settings ring has 2px inset.
- User review preserved preview code but hid it; removed duplicate active badge; corrected settings card clipping and responsive workspace entry.

Follow-up product review: removed Próximo passo, changed andamento to shared badge, embedded paginated audit history with in-place details and authorized lazy queries. Biome and TypeScript passed; 64 focused tests across 13 files passed. Browser verified contract 60 empty state, contract 62 audit row/details, unchanged history URL and overview removal.

Latest review: expanded workspace attachments (five rows verified without inner scroll), shared 4rem minimum file/empty/loading row, first direct workspace menu action on desktop and mobile, labelled full-width observations and theme icons. Browser confirmed first action and preserved return filters, observations spanning two columns and all three theme icons. 42 tests across 7 focused files passed; Biome and TypeScript passed.

Attachment scroll correction: workspace now fills remaining tab height with internal scrolling and fixed heading/upload action. Browser verified 14 files (909px content in 416px viewport), no outer body overflow. Drawer compact cap preserved.

Contract review: native related-record/navigation link titles, removed redundant history footer, added Alertas tab with date-aware overdue warnings, informational remaining balances and missing active revenue/responsible data. Schema validates derived alerts; optional fields are not required. Browser verified contract 58 informational balance, finance action, related-record title and absent history footer. Biome, TypeScript, strict OpenSpec and 17 tests across 4 files passed.

Review: alerts moved into overview, severity chips high/red, medium/amber, low/blue. Removed alerts tab; old alerts URLs fall back to overview. History now uses icon-size chevron pagination; browser measured all five buttons at 32x32px.

Inline navigation review: contract identifier/process triggers and mobile cards now open workspace; related contract references use route links. Explicit detail menu remains unchanged. Browser verified contract 61 workspace and preserved return filters without a dialog.

Attachment density review: empty text and skeleton reduced to one 20px text line, removing the previous 64px minimum and vertical padding. Actual file rows remain unchanged.

Follow-up add-pending-work-center replaces informational future-balance alerts with actionable-only alerts, aligns workspace calendar reference to America/Sao_Paulo and requires independent financial read grants. The current requirement was reconciled before either change is archived.
