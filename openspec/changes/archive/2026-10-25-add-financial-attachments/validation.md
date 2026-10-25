## Verification

- `openspec validate add-financial-attachments --strict`: passed.
- `pnpm check` and `pnpm check:ci`: passed.
- `npx tsc --noEmit`: passed.
- Focused attachments, fees, remunerations and workspace-search suite: 31 files, 174 tests passed.
- Production build: passed, with dependency-level bundler warnings about `use client` directives.
- Prisma schema validation and client generation: passed.
- Additive migration deployed to the configured database; migration status is up to date. Foreign keys and the six-owner database check were read back and verified. Existing attachment table permissions remain unchanged.
- Real owner/list queries for an existing fee returned the correct financial owner and an empty list.
- Actual configured storage write/read/remove checks passed for both fee and remuneration relative paths using temporary synthetic files without creating business records.
- Browser: receipt and remuneration Anexos page tabs load successfully; receipt upload modal shows 25 slots and existing PDF/JPG/PNG rules; remuneration contextual details and nested receipt details both show compact shared attachment sections. No business data was created or modified during UI verification.

## Full suite limitation

The broad suite initially reported 803 passed and four failures. One workspace-search assertion still expected fees/remunerations to reject the new tab; it was updated and passes in the final focused run. Three storage tests hit Windows filesystem `EPERM` when creating hard links in the restricted execution environment. A host-permission rerun of the unchanged storage tests passed 11/12; the remaining failure is directory relocation (`rename`), also `EPERM`. The production storage implementation only changed its owner-kind type; atomic publication and filesystem tests were not weakened or skipped. Real host storage write/read/remove checks for both new owners passed.

The local development server was restarted after Prisma regeneration because its cached singleton retained the old schema. Pages were rechecked after restart.
