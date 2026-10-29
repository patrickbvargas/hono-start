# Financial acceptance matrix

Planning contract, not a passing test report. Implementers must record actual test names/results in the phase tasks and final release evidence. [Decision register](../domain/FINANCIAL_DECISIONS.md) preserves approved answers; [roadmap](FINANCIAL_ROADMAP.md) defines prerequisites.

| Area | Required scenario | Expected assertion | Owning phase |
|---|---|---|---|
| Identity | One document with customer/supplier/employee roles | One Person, independent roles, no grants inferred | 01 |
| Account binding | Admin or Member without active profile | Denied protected access with safe configuration feedback | 01–02 |
| Shared masters | Same Person used in two Firms | Master shared; operational children never cross scope | 01–03 |
| Confidentiality | Member knows another beneficiary title ID | Detail, batch, options, counts, sums, export, proof and audit all deny/filter before aggregation | 02,07,08 |
| Optional mutation | Member receipts:create absent/present | Default deny; explicit grant only permits assigned-contract receipts | 02,05 |
| Generation | Double click/network retry | Single financial generation/title set | 03–04 |
| Origin integrity | Missing/multiple/wrong-Firm origin | Database/service constraints reject | 03 |
| Preview | 100 divided by 3 | 33.33/33.33/33.34; no titles before confirm | 04 |
| Reference | Reference10000/preview9500 or10500, with reason | Generation blocked atomically; justification cannot bypass equality | 04 |
| Entry total | Agreed100, entry20, installments40+40 | All preview titles included; exact equality allows confirmation | 04 |
| Stale agreement | Agreed amount changes after preview | Transaction revalidates current amount and rejects mismatch | 04 |
| Later adjustment | Authorized extra/edit after generation with reason | Permitted; visible difference, reference unchanged, audit retained | 03–04 |
| No competence | Due November, settled October | October actual cash; due-date forecast; no competence field/inference | 04,08 |
| Person balances | Same Person has receivable and payable balances | Separate authorized Firm totals, no offset or remuneration disclosure | 08 |
| Calendar | Jan31 monthly sequence | Feb last day then Mar31; no weekend shifts | 04 |
| Entry | Generate entry without settling | No cash/remuneration until actual receipt | 04–05 |
| Amount equation | Title100, P50 D5 J2 M0 | Cash47, outstanding50, unchanged due date | 05–06 |
| Full discount | P100 D100 J0 M0 | Settled title, zero realized cash, no remuneration | 05–08 |
| Above balance | Principal allocation exceeds locked balance | Rejected, no partial events | 05–06 |
| Sequence | Future title chosen before overdue title | Allowed within grants; old sequence/fee-slot rule absent | 05 |
| Receipt group | Different Person/Firm/method/direction | Cannot form one ReceiptBatch | 05 |
| Multiple payments | Ten Payables across lawyers, total5000 | One atomic action, ten Payments, no lot or beneficiary grouping | 06 |
| Payment boundaries | Cross-Firm, denied or stale line; duplicate Payable IDs | Reject entire selection; no partial cash/audit effects | 06 |
| Atomicity | Final line denies/fails commission generation | Entire group rolls back, including audit and downstream Payables | 05–07 |
| Concurrency | Two transactions settle same balance | Lock/revalidation allows only valid total principal, no over-settlement | 05–06 |
| Retry | Same settlement token submitted twice | Original result only; no duplicate receipts/payments/calculations; no payment lot introduced | 05–07 |
| Dates | Future effective date | Rejected using consistent Sao Paulo business date | 05–06 |
| Evidence | Receipt group partly reversed; independent Payment proof/reversal | Receipt shared owner preserved; Payment evidence remains individual and cannot expose other beneficiaries | 05–06 |
| Remuneration | Positive contract receipt with charges | Existing eligible participation formula uses actual cash base | 07 |
| Non-remunerating | Direct receipt, disabled toggle, zero cash | No generated obligations | 07 |
| Cutoff | Oct25/Oct26 receipt date; inserted later | Nov5/Dec5 at defaults, based on effective date | 07 |
| Catalog | Lawyer/assistant remuneration | Existing global PAYROLL_LAWYERS/PAYROLL_STAFF | 03,07 |
| Calculation snapshot | Change employee percentage after receipt | Existing calculation and generated due date unchanged | 07 |
| Paid dependency | Valid remuneration Payment, including full discount | Source receipt reversal blocked until payment reversed | 06–07 |
| Unpaid dependency | Receipt reversal before remuneration payment | Reversal and generated Payable cancellations atomic | 07 |
| Reversal date | Oct receipt/payment reversed in Nov | Original cash in Oct; signed reversing cash in Nov; principal reopens | 05–08 |
| Unique reversal | Repeat reversal request | No second effect; immutable reversal evidence | 05–06 |
| Counterparty | Person change after partial settlement | Must reverse all valid settlements first | 03,05,06 |
| Face amount | Discounted title principal50 already abated, cash45 | Cannot reduce below50, not45 | 03,05,06 |
| Settled edit | Increase settled title amount | New balance, unchanged past events, reason and audit | 03,08 |
| Reclassification | Analytic corrected after payment | Reports reclassify; audit preserves previous analytic | 03,08 |
| Cancellation | Title with valid settlement | Reject cancellation until reversal | 03,05,06 |
| Operational status | Cancelled/completed Contract has title balance | Financial settlement permitted; no automatic cancellation/completion mutation | 04–08 |
| Completion | One active Revenue ungenerated | Contract cannot be financially Quitado | 08 |
| Forecast | Partially settled title due last month | Remaining principal in overdue visibility; no vanished arrears | 08 |
| No double count | Expense → Payable → Payment | Actual outflow counts Payment only | 08 |
| Navigation | Every dependent route/drawer/export after reset | No legacy missing-table/reference errors; routes remain usable | 09 |

## Required verification levels

1. Pure decimal/calendar/rule tests and Zod contract tests.
2. Feature query/mutation/authorization tests with dependency mocks; React interaction tests for preview, selection, amount allocation, masking and reversals.
3. Real isolated PostgreSQL tests for FK/exclusivity constraints, concurrent settlement/generation, idempotency, rollback and downstream dependencies. Mocked Prisma tests cannot establish these guarantees.
4. Authenticated UI walkthrough and real private-storage owner checks in a development environment with both Member and Admin presets and at least two Firms/beneficiaries.
5. Full pnpm verify (read-only formatting, types, suite, production build). Follow phase tasks for pnpm check then npx tsc --noEmit; no suppressed known failures.

## Evidence record template

- Phase/change and Git revision:
- Database: verified disposable local/test target, schema/seed revision (never log secrets):
- Commands/checks actually run and results:
- Real transaction/concurrency scenarios:
- Member confidentiality and attachment checks:
- Walkthrough results/screenshots where relevant:
- Remaining blockers and target enablement status:
- Baseline rollback code/schema/config procedure verified:

## Contextual registration acceptance

- Admin with explicit grants sees separate Clientes, Fornecedores and Colaboradores; the same multi-role Person keeps one identity/document across screens.
- Authorized collaborator management can edit professional percentages; existing RemunerationCalculation snapshots remain unchanged.
- Member cannot access supplier/collaborator menus, direct routes, APIs, options, counts or exports.
- A readable customer who is also a collaborator exposes no EmployeeProfile, percentages, other role flags or access settings. Assigned-contract customer scope, permitted team projection and own remuneration remain intact.
- Owning phases: 01 (projections/UI), 02 (authorization) and 09 (end-to-end validation).

## Contract dimension acceptance — phase08

- Receivable100 with two same-type assignments and another type: one filtered row, count1, grand total100; once per distinct type group, visibly overlapping/non-additive, no implicit rateio.
- Remuneration Payable uses its exact source assignment type and receipt's revenue type/contract area, not every contract participant.
- Expense/direct titles appear under “Sem vínculo com contrato”; combining dimension filters uses OR within/AND across dimensions.
- Filtered outstanding principal, actual cash and dated reversals preserve existing measure/date semantics without fan-out.
- Query options, pagination counts, exports and drilldowns apply Firm/assigned-contract/beneficiary authorization before aggregation and never expose other collaborators' remuneration or professional settings to Member.

## Reset and seed readiness

Each phase verifies updated fixtures against its schema/contracts. Final phase runs `pnpm run db:reset` twice on the verified disposable dev database with the configured Clerk/Storage prerequisites, then verifies seeded counts, FK/origin integrity, calculated balances, immutable calculation evidence and no duplicate financial events. Exercise real Admin/Member login/bindings after both resets, menus, multi-role projections, pending/overdue/partial/settled titles, multi-beneficiary payments, reversals, contract dimensions and monthly forecasts/actual cash. Missing external prerequisite must produce actionable setup feedback; no silent ready claim, manual SQL repair or obsolete hardcoded provider IDs. Final full pnpm verify is required; planning validation is not evidence of successful reset.
