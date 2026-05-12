## 1. Change contract

- [x] 1.1 Add a remuneration-management spec delta that defines readable PDF export, UTF-8-safe output, and report totals for the filtered export dataset.

## 2. Export implementation

- [x] 2.1 Replace the current raw-string PDF builder with a structured report generator that supports UTF-8 text and tabular PDF layout.
- [x] 2.2 Add report summaries for record count, total amount, and collaborator-level totals while preserving existing export scope and ordering.
- [x] 2.3 Improve spreadsheet export encoding compatibility for UTF-8 consumers without changing the exported remuneration scope.

## 3. Verification

- [x] 3.1 Update focused export helper tests to cover UTF-8-safe content, structured report output markers, and derived totals.
- [x] 3.2 Run `pnpm check`.
- [x] 3.3 Run `npx tsc --noEmit`.
