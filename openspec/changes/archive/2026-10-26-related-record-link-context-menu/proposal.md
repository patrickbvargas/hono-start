## Why

Related links require opening a summary before reaching the record page. Offer direct page access while retaining contextual inspection.

## What Changes

- Add right-click and keyboard menus to all RelatedRecordLink triggers.
- Reuse Abrir página and Ver resumo labels; keep primary click opening summaries.
- Keep primary action configurable centrally and per link; retain normal link styling after coverage validation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contextual-entity-details`: add direct page choice to singular related links.

## Impact

Related-records link and orchestration, shared menu composition, focused tests, frontend and user-flow contracts. All authorized users benefit; existing tenant and resource checks remain authoritative. No API, database or dependency changes.

## Non-goals

Collection links, dashboard drilldown rows, lifecycle menu actions, and changing primary-click behavior.
