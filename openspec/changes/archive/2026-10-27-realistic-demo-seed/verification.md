# Verification

Reference date: 2026-10-26.

- OpenSpec strict validation passed.
- Eight focused fixture/dashboard tests passed, covering rolling years, every month, YTD/prior-year boundaries, totals including entries, lifecycle invariants, future forecasts and leap dates.
- TypeScript and repository Biome checks passed. Seed sources also checked/formatted separately because the repository Biome include list excludes Prisma sources.
- Production build passed with existing third-party module-directive warnings.
- Attachment storage: sandbox blocked hard links (EPERM); all 12 tests passed with host filesystem permissions.
- Real PostgreSQL verification used a uniquely named disposable schema, both database URLs scoped to that schema, and a separate private attachment directory. Existing migrations, client generation and seed passed. Schema removed after verification.
- Counts: 215 contracts, 464 assignments, 216 revenues, 207 fees, 414 remunerations, 342 expenses, 18 attachments, 1294 audit records.
- SQL recomputation: 2026 YTD receipts including entries = 273210.00; matching 2025 interval = 243657.40; 2024 interval = 228104.80.
- SQL verified persisted remuneration = rounded receipt amount times effective percentage; dates and deleted-fee cascades match.
- A second seed preserved every financial/assignment/expense/attachment ID and every audit identity/count.
- The reset command itself was blocked by Prisma's AI consent guard before execution. No guard was bypassed. Its non-destructive migration/generate/seed stages were exercised against the empty isolated schema instead. The actual application schema was not reset.

Full Vitest suite passed outside the filesystem sandbox: 191 files, 898 tests, 343.41 seconds. The earlier sandbox run reported the known hard-link EPERM failures and was superseded by this complete passing run.

## Pending-work severity follow-up

Replaced the generic current-payment example with an explicit upcoming second installment inside the reference-day reminder window. The first receipt's realized date and amount remain unchanged, preserving existing YTD snapshots. Nine calendar cases cover January 1/31, February 28/29, March 31, April 30, October 26/31 and December 31. Actual payment-plan and workspace-alert helpers classify the three named fixtures as high/medium/low. Focused suites: 5 files and 34 tests passed; TypeScript and Biome passed. The existing application database was not reseeded automatically; running db:seed or db:reset applies the updated fixture dates.
