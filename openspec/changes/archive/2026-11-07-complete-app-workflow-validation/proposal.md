## Why

The UI audit in TODO.md found that the persistence migration left executable legacy financial workflows, broken dashboard/pending-work screens, misleading guidance and unsafe numeric normalization. Users cannot complete and verify the canonical operational-to-financial journey reliably.

## What Changes

- Restore dashboard and pending-work reads using pure titles, movements and bridges, preserving authorization before totals and options.
- **BREAKING**: remove obsolete fees/remunerations feature implementations and their obsolete grants/actions; legacy URLs redirect to the canonical financial collections.
- Separate operational revenue editing from title planning, show every generated title including entry/extra/cancelled rows, and keep financial obligations independent from operational deletion.
- Preserve invalid settlement amounts until validation; synchronize successful settlements/reversals with all visible reads.
- Standardize navigation, audit labels, financial terminology, recovery controls and workflow guidance.
- Align canonical documentation and tests, and update TODO.md with actual verification results and environment-dependent omissions.

## Capabilities

### New Capabilities

- `app-workflow-convergence`: Acceptance contract for completing the migration across app entry points, financial projections, input behavior, navigation and regression verification.

### Modified Capabilities

Existing domain invariants remain unchanged. This change implements the canonical docs and records cross-cutting convergence requirements in the new capability; it does not redefine financial arithmetic or expand Member permissions.

## Non-goals

- No production seed/reset, destructive migration, permission expansion or new organization creation.
- No new payment provider, external transfer, bulk-settlement interface or manual-title creation interface. These are outside the current documented consultation UI.
- No assertion of live Member/multi-organization/storage verification without suitable authenticated fixtures.

## Impact

Dashboard, pending-work, contracts, title-settlements, related-records, authentication settings, audit, sidebar, legacy routes, shared form/cache/error UI, documentation and tests. Admin retains branch-wide access; Member retains assigned-contract reads and strictly own remuneration. Global identities stay shared; every operational/financial read remains branch scoped. Existing schema/seed change remains separate and is verified without resetting the database. No new runtime dependency.
