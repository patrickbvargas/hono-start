## Context

The current remuneration export builder creates PDFs by concatenating raw PDF objects and writing plain text lines with a built-in Helvetica font. That implementation is minimal but brittle:

- built-in PDF Type1 fonts do not provide safe Unicode coverage for the pt-BR copy and accented collaborator names used by the product
- page content is laid out as flat text lines rather than as a report table
- line-count chunking does not reflect true rendered height, so long values can break the visual structure
- the export contains no report summary or totals, which forces manual review outside the system

The export boundary itself is already in the right place. The remuneration feature owns export orchestration, the server handler already reuses the existing remuneration scope and filters, and the feature-local test surface already covers export helpers. The change should therefore stay local to the remuneration slice and improve output generation without altering route structure or data access scope.

## Goals / Non-Goals

**Goals:**
- Generate PDF output that preserves pt-BR and accented user data reliably.
- Present remunerations in a table with explicit headers, aligned numeric columns, and stable visual grouping.
- Include summary information that helps users read the report without recalculating totals manually.
- Preserve the existing role-aware export scope, filters, and deterministic ordering.
- Keep the implementation inside the remuneration feature boundary.

**Non-Goals:**
- Replacing the export menu UX or introducing additional export formats.
- Changing the remuneration query or permission model.
- Generalizing the report generator for all entities in the application.

## Decisions

### D1. Replace hand-written low-level PDF assembly with a feature-local HTML report rendered through the existing runtime

The current hand-written PDF string is the root cause of the Unicode and layout issues. Instead of adding more low-level PDF string manipulation, the feature should render a small HTML report with explicit document metadata, CSS table layout, and UTF-8 encoding, then convert that HTML to PDF using a real browser engine.

This gives the remuneration feature:
- proper Unicode rendering
- predictable table layout
- automatic page breaking
- reusable CSS for totals, alignment, and headers

Alternative considered: continue generating raw PDF objects with a different embedded font. Rejected because it would still leave the feature responsible for low-level pagination, table drawing, and text measurement.

### D2. Keep report generation feature-local and data-driven from the existing remuneration read model

The current remuneration read model already exposes enough data to build a useful report: collaborator, client, contract, payment date, amount, percentage, lifecycle state, and override state. The PDF and CSV builders should continue consuming the feature-local `Remuneration` model rather than introducing a second export-only DTO.

This keeps the export behavior aligned with the feature slice pattern and avoids expanding the change into shared abstractions.

### D3. Add summary blocks for report readability

The export should not be a raw row dump. Users need quick answers when reviewing the file. The PDF report will therefore include:
- generation date
- record count
- total remuneration amount for the filtered dataset
- collaborator subtotals sorted by the same exported dataset

These summaries are derived purely from the exported rows and do not change business meaning or query behavior.

### D4. Preserve CSV output but use an Excel-safe Unicode encoding

The spreadsheet export must remain compatible with Excel on Windows, which in practice can still misread accented Portuguese content even when a UTF-8 BOM is present. The export should keep the same row content and role-aware scope, but the server boundary should encode the CSV payload using a Unicode format that Excel consistently opens with correct accents and column parsing.

Alternative considered: switch spreadsheet export to XLSX. Rejected because the product contract only requires spreadsheet output, and a CSV encoding fix is the smallest change that addresses the practical Excel issue.

## Risks / Trade-offs

- [Risk] Browser-based PDF rendering can add runtime overhead. -> Mitigation: keep the HTML document simple and scoped to a single report, and create the browser only inside the export path.
- [Risk] A browser dependency may require an additional package install. -> Mitigation: choose a well-supported package and keep the integration isolated to the remuneration export utility.
- [Risk] Long datasets may span many pages. -> Mitigation: rely on browser print layout with repeatable table headers and avoid absolute-positioned content.
- [Risk] New totals could be misread as changing business logic. -> Mitigation: derive every total directly from the exported filtered rows and label summaries clearly in pt-BR.
