## Why

The remuneration export flow already exists, but the PDF output is not fit for operational use. The current implementation builds a low-level PDF string by hand, which produces broken accented characters, unreadable line-based layout, and no aggregate totals. That violates the product expectation that administrators can trust remuneration outputs without manual reformatting or recalculation.

## What Changes

- Improve the remuneration export capability so PDF output preserves Portuguese text correctly, including accented names and labels.
- Replace the current line-dump PDF layout with a structured tabular report that is understandable when shared or printed.
- Add report summaries so exported remunerations show record count, total amount, and collaborator-level totals derived from the same scoped and filtered dataset.
- Keep export scope, filters, ordering, and permission behavior aligned with the existing remuneration list and export contract.
- Improve spreadsheet encoding compatibility for Excel-style consumers that mis-handle UTF-8 CSV files.

## Capabilities

### Modified Capabilities
- `remuneration-management`: remuneration export output quality, PDF structure, and spreadsheet encoding.

## Non-goals

- Changing remuneration visibility, filter semantics, or export permissions.
- Reworking remuneration generation formulas, manual override behavior, or fee-side recalculation logic.
- Building a generic cross-feature reporting or document platform beyond the remuneration export surface.

## Impact

- Affected code: `src/features/remunerations/utils/export.ts`, the remuneration export server boundary in `src/features/remunerations/api/queries.ts`, and focused export contract tests.
- Affected users: administrators and regular users who export scoped remuneration data.
- Multi-tenancy and role scope remain unchanged because export will continue to reuse the same session-derived remuneration query scope as the on-screen list.
