## Context

Prisma 7 requires explicit seeding after reset. Existing fixtures repeat six scenarios in fixed years and rebuild child rows, invalidating references. Dashboard compares selected dates against the same dates one year earlier and includes down payments in realized revenue.

## Goals / Non-Goals

Goals: realistic demo data after db:reset, comparable monthly/YTD totals, lifecycle and evidence examples, stable IDs on repeat runs.
Non-goals: change KPI formulas, provision Clerk accounts, change permissions or production data.

## Decisions

- Keep lookup bootstrap and Prisma persistence in seed.ts; isolate pure deterministic fixture generation in prisma/seed-fixtures.ts for focused tests.
- Use SEED_REFERENCE_DATE (YYYY-MM-DD), defaulting to today's date in America/Sao_Paulo. Generate monthly cohorts for two complete prior years and elapsed months of this year. Never persist future realized payments; future revenue plans remain forecast only.
- Use stable business keys and reconcile children by their parent and natural fixture identity instead of deleting financial history. Populate createdAt coherently before payment dates.
- Use real local example image bytes through existing attachment storage; require ATTACHMENTS_DIR before writes. Create immutable, deduplicated demo audit entries with before/after data.
- Keep reset explicit: migrations, client generation, then one seed invocation. No new dependencies.

## Risks / Trade-offs

- Reset destroys local database data: do not execute against an unidentified configured database; verify on an isolated local database when available.
- Date rolling changes the fixture window: pin SEED_REFERENCE_DATE for reproducible previews. Old cohorts are retained on direct reruns; reset establishes the exact current dataset.
- Clerk is external: account access remains separately configured, including optional employee binding.
- Attachment storage must be configured and writable. Fail early rather than publish broken attachment links.

## Migration Plan

No schema migration. Run db:reset on development/demo database with private attachment storage configured. Roll back source changes and recreate demo data if needed.
