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
| Reference | Reference10000/title10500 | Reason required, reference preserved, difference visible | 04 |
| Calendar | Jan31 monthly sequence | Feb last day then Mar31; no weekend shifts | 04 |
| Entry | Generate entry without settling | No cash/remuneration until actual receipt | 04–05 |
| Amount equation | Title100, P50 D5 J2 M0 | Cash47, outstanding50, unchanged due date | 05–06 |
| Full discount | P100 D100 J0 M0 | Settled title, zero realized cash, no remuneration | 05–08 |
| Above balance | Principal allocation exceeds locked balance | Rejected, no partial events | 05–06 |
| Sequence | Future title chosen before overdue title | Allowed within grants; old sequence/fee-slot rule absent | 05 |
| Group | Different Person/Firm/method/direction | Cannot form one batch | 05–06 |
| Atomicity | Final line denies/fails commission generation | Entire group rolls back, including audit and downstream Payables | 05–07 |
| Concurrency | Two transactions settle same balance | Lock/revalidation allows only valid total principal, no over-settlement | 05–06 |
| Retry | Same settlement token submitted twice | One group and no duplicate cash/calculations | 05–07 |
| Dates | Future effective date | Rejected using consistent Sao Paulo business date | 05–06 |
| Evidence | Add proof after partial group reversal | Shared owner and authorization remain intact | 05–06 |
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
