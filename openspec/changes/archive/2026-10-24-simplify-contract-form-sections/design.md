## Context

Contract form arrays currently use the shared collapsed accordion, including empty rows. The form already owns add/remove actions, Zod schemas and summary helpers. The existing FormSection action slot now aligns add actions with headings.

## Goals / Non-Goals

**Goals:** Visible team fields, guided revenue editing, stable focus and useful collapsed summaries.

**Non-Goals:** New financial rules, permissions, data fields, database or API changes.

## Decisions

- Render team rows directly; retain the shared accordion for larger revenue rows. All-open revenues would unnecessarily lengthen completed forms.
- Add an optional automatic-open predicate to the shared accordion; consumers without it retain existing behavior. Incomplete rows open automatically; manual collapse is always allowed. A new submission attempt reopens invalid rows.
- Feature-owned hook manages stable row keys and focus on additions. Keys must survive value changes and removal of preceding rows; object-reference keys would remount inputs during editing.
- Use existing Zod schemas and full contract validation after a submit attempt to identify revenue errors. Keep field rendering and orchestration separate.
- Reuse existing shared components and local library signatures. Context7 is unavailable in this session; no new library APIs or dependencies are introduced.

## Risks / Trade-offs

- Visible team fields increase height → compact two-column desktop rows and stacked mobile inputs.
- Automatically opened invalid revenue can grow the form → retain internal modal scrolling and allow valid rows to collapse.
- Add/remove can shift field indices → stable keys move with surviving rows.

## Migration Plan

Presentation-only deployment; no migration. Roll back affected form and optional shared accordion behavior if needed.
