## MODIFIED Requirements

### Requirement: Export uses the same scope as the on-screen list
The system SHALL export remunerations using the same session-derived firm, role, employee scope, filters, and ordering as the on-screen remuneration list, and the exported output SHALL be readable without manual character repair or manual total recalculation.

#### Scenario: PDF export preserves pt-BR and accented collaborator data
- **WHEN** a user exports remunerations in PDF format
- **THEN** the generated document SHALL preserve Portuguese labels and accented collaborator or client names without broken character substitution

#### Scenario: PDF export uses a tabular remuneration report layout
- **WHEN** a user exports remunerations in PDF format
- **THEN** the generated document SHALL present the filtered remuneration rows in a readable table
- **AND** the table SHALL expose explicit column headers for the exported remuneration fields
- **AND** value columns SHALL remain visually understandable across page breaks

#### Scenario: PDF export includes report-level totals
- **WHEN** a user exports remunerations in PDF format
- **THEN** the generated document SHALL show the quantity of exported remuneration rows
- **AND** the document SHALL show the total remuneration amount for the filtered dataset
- **AND** the document SHALL show collaborator-level subtotals derived from that same filtered dataset

#### Scenario: Spreadsheet export remains Excel-safe for accented pt-BR data
- **WHEN** a user exports remunerations in spreadsheet format
- **THEN** the generated file SHALL preserve Portuguese labels and accented collaborator or client names when opened in Excel-compatible spreadsheet consumers
