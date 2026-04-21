## Why

The authenticated home route still renders a demo form and fake pagination instead of the product dashboard. The application needs a real default landing area that summarizes scoped operational and financial state for the current firm or user.

## What Changes

- Replace the `/` demo form route with a dashboard route.
- Add dashboard server data that respects firm isolation and user scoping.
- Show revenue totals, remuneration totals, monthly comparisons, recent activity, and charts by legal area and revenue type.
- Keep UI copy in pt-BR and reuse shared route/layout/UI patterns.
- Remove fake demo pagination from the home route.

## Non-goals

- No new charting dependency.
- No authentication redesign.
- No changes to financial calculation rules.
- No audit-log implementation beyond recent supported business events already stored by current entities.

## Capabilities

### New Capabilities

- `dashboard`: Authenticated dashboard summaries, charts, and recent activity scoped by role and firm.

### Modified Capabilities

- None.

## Impact

- Adds `src/features/dashboard`.
- Updates `src/routes/index.tsx`.
- May add a shared HeroUI `Card` re-export.
- Reads existing Prisma entities only; no database schema changes.
