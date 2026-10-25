# Validation

## Automated checks

- `openspec validate entity-management-pages --strict`: passed.
- `pnpm check`: passed without diagnostics.
- `npx tsc --noEmit`: passed.
- Focused workspace, navigation, contextual drawer, detail skeleton and attachment composition tests: 58 passed.
- Complete Vitest suite with local filesystem permissions: 170 files and 735 tests passed. A subsequent focused contract restoration test was added and checked separately.
- `pnpm build`: passed. Bundler reports dependency-level `use client` directive warnings; no build errors.
- `git diff --check`: passed.

The initial restricted full run encountered filesystem EPERM errors in hard-link attachment publication and two obsolete navigation/copy expectations while those tests were being updated. The attachment tests passed with local permissions; the final full run above passed after the expectation changes. No storage implementation or filesystem test was weakened.

## Browser checks

Used a separate temporary authenticated localhost tab and closed it afterward. No business records were created, changed, deleted or restored during inspection.

- Expense identity opened its dedicated page with record actions and existing fields.
- Expense attachment tab survived reload and displayed the existing expanded upload/empty state.
- Receipt and remuneration dedicated pages displayed existing relationships and financial explanations.
- A receipt's related contract opened a drawer without changing the receipt URL. The drawer retained edit/delete options. Its edit form opened above the drawer; closing both returned to the originating receipt page.
- At 390×640, page actions and tabs remained reachable and document scroll width equaled viewport width (390px). The contract edit form scrolled within its modal and retained a visible save footer. Viewport override was reset afterward.
- Mobile receipt cards opened pages by default. Their menus explicitly exposed Abrir página and Ver detalhes. Ver detalhes retained the legacy detailId drawer URL, and closing it preserved the collection.
- Collaborator page displayed existing business data, percentages, attachment/history tabs and scoped contract collection link. Reload on history retained the tab and loaded its scoped empty state.
- Audit identity opened a read-only record page with summary and change details and no lifecycle actions.
- Client page return link retained an applied `query=Ana` filter; returning restored the populated search field.

## Limits

Lifecycle writes were verified through mocked component/hook tests and existing server mutation coverage, without submitting business mutations in the live local dataset. Browser inspection used the available authorized account; restricted grants were checked through focused tests and existing server authorization coverage.

## Visual consistency review

Contracts now use the same EntityWorkspace as every other record page. Shared identity/action header, labels, divider, section width and spacing were inspected in the browser. Contact, finance and audit-specific sections are addressable tabs; business registration dates are in history and lifecycle state is not repeated in the page body. Complete drawers retain their default content. Remuneration finance no longer repeats monetary explanations or the installment inside its receipt label.

Automated results: pnpm check and npx tsc --noEmit passed; the full suite passed 171 files / 749 tests. After the final receipt-label cleanup and additional regression assertion, a focused run passed 3 files / 20 tests. Production build passed on the final sources; one intervening build attempt failed, and rerunning the same final sources passed. OpenSpec strict validation and diff whitespace checks passed.

Browser review covered contract, client, employee, receipt, remuneration, expense and audit pages. Contract overview/history, receipt finance, client contact/reload, employee percentages, remuneration calculation, expense overview and audit changes/technical sections displayed the intended content. Contract and receipt headers were compared on desktop and at 390x640. Contract attachments were checked at 360x480; document scroll width equaled viewport width at both sizes. Tabs remain internally scrollable when necessary. Temporary viewport settings were reset and review tabs closed. No business writes were submitted.

## Related collections and contract alerts

Implemented an exact optional feeId filter for remunerations, applied through the shared where-builder to list rows, counts, totals and exports. Receipt links use the persisted ID, expose a removable receipt chip and preserve own/all scope. Clearing all filters explicitly removes feeId. Employee finance links respect own/all remuneration visibility.

Client and employee pages reuse the central protected pending-work query for five-row contract-alert previews with exact related IDs, full authorized summary counts and a link to the complete filtered list. Contract inspection retains contextual drawers. Subject-grant gating prevents unauthorized preview queries, and loading, safe errors/retry and empty states remain local. No database migrations or per-contract query fan-out.

Checks passed: pnpm check, pnpm check:ci, npx tsc --noEmit, production build, OpenSpec strict validation and git diff --check. Complete Vitest run passed 174 files / 772 tests, including receipt filter, list/aggregate/export consistency, own-scoped links, related alert query scope and loading/error/empty/permission coverage.

Browser checks confirmed receipt #125 navigates to feeId=125 with exactly four remunerations and a filtered total of R$ 2.160,00. Removing its chip restored the general list. Employee #1 preview showed five of nine alerts and the full-list link retained employeeId=1. Its contract reference opened a drawer without changing the employee page URL. Client #3 showed three alerts for three contracts with clientId=3 on the full-list link. Employee finance linked to its employee-filtered remunerations. Client alert layout was checked at 390x640 with document width equal to viewport width. Temporary tabs were closed and viewport reset. No business records were mutated and no live exports were downloaded.

## Compact chrome review — 2026-10-25
- Shared page header now owns Editar/Excluir/Restaurar; identity, ID and status share one row (28px desktop, 24px mobile).
- Browser verified employee overview at 1280x720: wrapper overflow hidden, 644px client/scroll height; tab panel 508px client height / 738px content. Keyboard scrolling changed panel scroll while wrapper stayed at zero and identity remained fixed.
- Contract at 360x480: document width equals viewport (360px), compact identity and header actions visible; horizontal tabs remain navigable. Expanded attachments retain internal list scrolling.
- Remuneration 288 finance browser snapshot contains values/source fields and neither removed explanatory paragraph.
- Focused workspace tests: 4 files / 27 tests passed. Biome, TypeScript, production build and strict OpenSpec validation passed.

Final full suite: 174 files / 773 tests passed. Initial restricted run hit temporary-file access failures in attachment storage; its isolated rerun (12/12) and the full suite passed with the required filesystem access. Attachment browser geometry confirmed a 468px internal viewport with 909px scroll content and hidden outer tab overflow.

## Alert list spacing review — 2026-10-25
- Identity now has vertical padding and 12px inline gaps, remaining one line.
- Employee desktop overview: tab 492px with no overflow; alert viewport 228px with 466px content. Client 3: tab 492px, alert viewport 264px with 280px content.
- Mobile 390x640: wrapper and tab client/scroll heights equal; alert viewport 168px with 766px content. Keyboard scrolling moved the alert viewport to 299px while wrapper and tab scrollTop stayed zero. Document width equals viewport width.
- 3 focused files / 23 tests passed; Biome, TypeScript, strict OpenSpec validation and diff whitespace checks passed.

Final team-width review: contract team tab uses the shared full-width section option. Browser measured team list and panel at the same 984px width. Biome and TypeScript passed.
