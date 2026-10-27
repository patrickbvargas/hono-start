## Context

Creation snapshots currently render as field changes. The requested adjustment concerns presentation only.

## Goals / Non-Goals

Goals: omit CREATE field-change summaries and preserve full technical payloads.
Non-goals: persistence, seed, schema, permissions or historical data changes.

## Decisions

- Return an empty structured presentation for CREATE while preserving rawJson unchanged.
- Omit the change summary in the drawer; retain addressable tabs with an explanatory message on Alterações.
- Keep the existing audit writer and demo seed payloads intact.
- No new APIs or libraries; Context7 is unavailable in this session.

## Risks / Trade-offs

- Hidden summary could imply missing data → full technical payload remains available.

## Migration Plan

Deploy presentation changes without database migration.
