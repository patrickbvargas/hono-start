# Verification — final simplified model

## Final scope

- Global: original Client and Employee (including type/percentages/status), lookup options. No firmId, profiles, branch links or alias entities on the masters.
- Branch: contracts, revenues, fees, remunerations and expenses, including counts/financial summaries inside global master screens.
- Origin-aware evidence: attachment and audit firmId retain upload/event provenance; visibility follows the shared master or branch operation. Optional audit owner references preserve visibility after attachment deletion.
- Frontend restored to ordinary existing forms/tables without directory/link actions or notices. Seed preserves Firm 1 Matriz and adds Firm 2 POA.

## Completed checks

- Focused backend suite: 14 files, 137 tests passed. Includes global master selectors/writes, attachment owner visibility and capacity, operational evidence guards, shared audit/search/history and cross-Organization actor identity.
- TypeScript passed. Prisma schema formatted and client regenerated. Strict OpenSpec validation passed.
- `pnpm check` passed. Production build passed with normal Windows host permissions.
- Full suite: 201 files; 993 passed, 9 failed. Eight match the previously verified baseline. The ninth was an obsolete test asserting firmId on the shared employee identity lookup; corrected the assertion while retaining firm-scoped remuneration assertions and reran that complete file: all 3 passed. No production behavior changed after the full run.
- Total focused backend coverage across the completed runs: 15 files, 140 tests passed.

## Migration rehearsal

Generated schema diff was augmented with backfill before dropping profile fields/tables and executed on disposable PGlite/PostgreSQL. Verified original Client/Employee IDs, direct registration fields and percentages, absence of firmId/profileId on masters, unchanged attachment storage path with restored clientId ownership, audit owner and origin-firm preservation, and atomic rejection/rollback for duplicate old memberships. Orphan profiles and duplicate memberships require explicit reconciliation before deployment, preserving Clerk employeeId anchors instead of selecting an arbitrary row.

No configured database was reset or migrated. Apply the subsequent `20261027150000_global_clients_employees` migration after review; earlier migration history remains intact for databases that already applied it.

## Known unchanged baseline

Eight failures were verified on an unchanged HEAD snapshot in contract/pending-work filter UI, dashboard search defaults, route prefetch expectations, and three chart-height assertions. These are outside this backend change.


## Multi-unit reset demo follow-up

- Matriz retains the complete rolling dataset; POA gets 17 contracts and 12 expenses with shared master IDs and independent values (60% of matching examples).
- Shared master evidence is created once. Each unit receives operational attachments and audit; demo attachment creation now records its owner for shared history and uploader attribution.
- Twenty focused demo/pending tests passed, including new POA invariants across year boundaries and leap February. TypeScript and read-only Biome checks passed.
- All migrations were applied to an isolated empty PostgreSQL schema, then the real Prisma seed completed against an isolated attachment directory. Confirmed records in both Firms, common client IDs, matching financial ancestry Firm IDs and no duplicate Client/Employee audit actions. Existing application schema and storage were not reset.
- Prisma's destructive reset guard was respected; migration deploy on the empty isolated schema validated the migration chain without bypassing the guard. Windows hard-link creation required host permissions for the disposable evidence directory.
- A second real seed preserved every fixture ID across ten tables and kept attachment/audit counts unchanged. Temporary schema and files were removed after verification.


## Documentation and archive review

The canonical scope matrix and operational examples are in docs/domain/MULTITENANCY.md, linked from the index and owning guides. Obsolete statements claiming Firm ownership for all business records or omission of a cross-Firm Employee actor were removed. Main specs for directory, clients, employees, Clerk/session, attachments, audit, dashboard filters and demo fixtures were synchronized without altering unrelated feature behavior.

A fresh reset is verified to produce no duplicate master audit actions. Existing populated databases that traversed the intermediate profile migration can retain both original and derived historical audit copies; resetting disposable demo data resolves that historical presentation issue. Applied migrations were not rewritten and existing audit data was not deleted as part of this follow-up.

Final archive checks: 19 focused files / 173 tests passed; all 45 canonical specs passed strict validation; Biome read-only check passed. No active OpenSpec changes remain. Specs were synchronized and compared requirement-by-requirement before archiving with --skip-specs to avoid reapplying already-synced additions.
