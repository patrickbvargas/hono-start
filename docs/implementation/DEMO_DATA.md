# Demo data

## Recreate the preview

Set DATABASE_URL and DIRECT_URL to the same development business database and configure an isolated private R2 bucket and server credentials as described in ATTACHMENTS.md. Run:

```sh
pnpm run db:reset
```

This deletes the configured schema, applies migrations, generates Prisma Client and executes the seed exactly once. It does not modify Clerk accounts. The seed uses DIRECT_URL and honors its PostgreSQL schema so migration and seed targets match.

By default the reference is today's date in America/Sao_Paulo. For a fixed preview, set `SEED_REFERENCE_DATE=2026-10-26` in .env. Invalid dates fail before fixture writes. Remove the setting for rolling dates.

## Dataset

- Matriz (Firm 1), POA (Firm 2), all canonical lookup catalogs, 20 global clients (individual/company) and 21 collaborators (lawyers/assistants), including inactive and deleted master records.
- Six monthly contract cohorts for each month in two complete prior years and elapsed months of the reference year, plus eleven named lifecycle/operational examples. October 2026 gives 215 contracts and 342 expenses.
- All legal areas and revenue types; responsible, referring/referred and assistant assignments. Names, amounts, Brazilian document checksums and fictional process identifiers support realistic browsing.
- Down payments, no down payment, partial payments, settled contracts, automatic remuneration, manual remuneration adjustments and receipts without remuneration generation.
- Overdue, current and future plans; cancelled/inactive/deleted contracts; deleted receipt with remuneration cascade; settled contract with completion locked; multiple revenues; missing active responsible and missing active revenue examples.
- Ten recurring expense categories with plausible seasonal and annual variation. Inactive/deleted expenses do not contribute to normal dashboard totals.
- Immutable creation/deletion/manual-adjustment audit examples and three readable PNG example documents for each of six attachment owners. Files are explicitly illustrative and have no legal validity.

## Multiple units

Matriz retains the full historical dataset. POA has 17 contracts (six recent monthly examples plus eleven lifecycle/pending examples) and 12 expenses. POA reuses the same global client and employee IDs, while its contracts, assignments, revenues, receipts, remunerations and expenses belong to Firm 2. Its monetary values are 60% of the matching Matriz examples so switching units visibly changes totals. Process numbers may repeat across units, as uniqueness is per Firm.

Global master creation/deletion history and their example attachments are seeded once, with Matriz as origin, and remain visible from both units under existing permissions. Each unit has its own operational audit and attachment examples, including attachment creation history. Repeating seed at the same reference date preserves these identities. A reset migrates an empty schema before generating examples, so the historical profile-copy migration does not create duplicate master audit events.

Configure two Clerk Organizations with privateMetadata.firmId equal to 1 and 2, respectively, and grant the demonstration account membership in both. The seed does not create provider accounts, memberships or permissions.

## Pending work walkthrough

After seeding, Pendências includes all three severities at the seed reference date:

- Alta: `Parcelas em atraso`, with an unpaid overdue installment.
- Média: `Próxima parcela em até sete dias`, with installment 1 paid and installment 2 due in zero to three calendar days. Dates round-trip through the monthly schedule at month/year boundaries and leap February.
- Baixa: `Quitado com conclusão bloqueada`, fully paid but still ACTIVE for andamento review.

Pending work uses the actual current São Paulo day, independently of dashboard filters. A pinned seed reference date must match the presentation day for the upcoming example to remain medium. Rerun seed without a pinned date to refresh it; an unrefreshed upcoming example eventually becomes overdue.

## Dashboard walkthrough

Select January 1 through the reference date for YTD. Comparisons use the same calendar interval one year earlier. Both years contain monthly receipts, down payments, remuneration and expenses. Completed contracts retain financial history. No realized receipt/expense/remuneration is dated after the reference day; future plans supply forecast examples only.

With reference 2026-10-26, authorized firm-wide YTD receipts (including entries) total R$ 273.210,00; the 2025 comparable interval totals R$ 243.657,40. Additional dimensions or narrower permissions intentionally change totals. The two historical years retain November/December data for full-year and 12M demonstrations.

## Repeating and access

`pnpm run db:seed` with the same reference date preserves fixture IDs, file ownership and audit event identities. It reconciles owned business fixtures rather than deleting financial rows. Changing reference dates can retain older cohorts or existing user-added records; reset recreates the exact demo window. Private files from prior resets are not deleted automatically; use an isolated disposable demo R2 bucket when regenerating fixtures.

Clerk credentials, Organization membership and grants remain externally configured. Use an authorized administrator to preview all features. For own/assigned visibility, bind Clerk privateMetadata.employeeId to an active seeded collaborator after reset; never bind an inactive/deleted collaborator. Numeric IDs can change between environments. No local role/email fixture grants access.
