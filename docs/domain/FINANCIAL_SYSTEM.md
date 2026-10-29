# Financial system — approved target contract

Status: approved design, not implemented. Decision date: 2026-10-29. This document is self-contained and normative for the ordered financial redesign. Existing code remains the development baseline until the implementation gates in [the roadmap](../implementation/FINANCIAL_ROADMAP.md) pass. It must not be mistaken for evidence that any target feature is live.

## Scope and vocabulary

Operational roots are Contract and Expense. Revenue and contract assignments belong to Contract. Financial roots are Receivable, Receipt, Payable and Payment. There is no new Order or Invoice module in this scope; their addition later must not require adding origin-specific calculation columns to financial titles.

UI language is pt-BR: Duplicatas a receber, Recebimentos, Duplicatas a pagar, Pagamentos, Acerto financeiro, Analíticas, Observações. Code uses English. Fee becomes Receipt. Remuneration ceases to be a second financial obligation; its obligation is a Payable, with separate RemunerationCalculation evidence. See [UML](FINANCIAL_UML.md).

Person is a company-wide master with cumulative customer/supplier/employee flags. PersonType replaces ClientType (INDIVIDUAL/COMPANY). EmployeeProfile holds employee type, OAB and percentages. Flags never grant login or financial authority. Clerk binds to Person with an active, non-deleted EmployeeProfile; all roles require this binding. Membership chooses an existing Firm. Person and catalogs are global; operational documents, financial titles, receipt batches, settlements and calculation records are Firm-scoped. No cross-Firm reference or group is allowed.

## Operational origins and financial handoff

1. Create Contract with customer, assignments, notes, attachments and one or more Revenue records; or Expense with counterparty, notes and attachments. Expense always has a notes field; text is not required merely because the field exists.
2. Acerto financeiro inherits the origin's negotiated/reference amount. User supplies down payment (if any), its due date, installment count and explicit first installment due date, expected payment method and analytic.
3. Generate an editable preview. Each entry/installment has an amount and due date; user can add/remove rows or change values, dates, analytic and expected method before confirmation. Nothing is persisted as a financial title before confirmation.
4. Confirmation requires the sum of all preview titles, INCLUDING the down payment, to equal the agreed total exactly in cents. Both a shortfall and an excess block generation, even with justification; validate again on the server against the current agreed amount inside the transaction. Correct the preview or explicitly correct the agreed amount with the existing permission/reason/audit rules before confirming. Confirm creates all titles and the generation record atomically. Retrying the same confirmation cannot duplicate titles. Existing generation is shown rather than silently regenerated. Later changes are explicit financial adjustments/extras, with justification and audit.
5. Operational screens consume financial status. Operators need not administer settlement. Completing, cancelling or inactivating the origin never silently cancels debt or blocks authorized settlement of otherwise valid titles. Reopening financial balances never changes operational andamento automatically; retire the current automatic completion coupling.

Finance can also create titles directly. Every title has exactly one identifiable origin: current Revenue, Expense, receipt-generated remuneration, or explicit direct financial entry. Future modules add enforced origin relationships. A generic originType/originId string pair without referential validation is insufficient. No mandatory Expense wrapper for remuneration or direct entries.

## Amounts, dates and status

- Store the negotiated/reference amount separately from the financial total. It can be changed with permission, reason and audit, without rewriting titles. Active-title sum determines financial total; down-payment total is the sum of entry titles, never automatic cash received.
- Difference = reference amount minus financial total. At acerto confirmation the difference MUST be zero; justification never bypasses this constraint. After generation, the already-approved authorized title edits/extras may produce a visible difference with reason and audit; initial equality does not impose permanent equality or rewrite the agreed amount. Neither adjustment invents a settlement.
- Scheduled amounts use decimal cent precision. Allocate remaining rounding cents to the final installment: 100 / 3 = 33.33, 33.33, 33.34.
- First installment date is explicitly entered, replacing implicit start-date-plus-one-month behavior. Subsequent monthly dates derive from the original requested day: Jan 31 → Feb 28 → Mar 31. No automatic weekend/holiday shift. Entry has its own due date.
- Principal balance = title amount minus valid principal abatements. Quitada is derived when balance is zero; Pendente means no abatement, Parcial means some with remaining balance. Em atraso means due date precedes current business date with positive balance and can coexist with partial status. Cancelled titles are a separate lifecycle state, excluded from collectible/payable forecasts.
- A partial balance retains its original due date unless explicitly adjusted. Historic title dates are never shifted automatically to today.
- An authorized user can change amount/due date, including on settled titles, with reason and audit. Minimum amount is principal already abated, INCLUDING discounts, not net cash. Increasing settled amount reopens balance. Changing person requires all valid settlements to be reversed first.
- A title can be cancelled only without valid settlements. Cancellation preserves history; it is not a money reversal. Restoring titles must revalidate origin, Firm, person, grants and current invariants.
- One analytic per title. Authorized reclassification requires reason/history, does not require settlement reversal, and reclassifies its settlements in reports. Historic classification remains visible through audit.

## Receipts, payments and batches

Every Receivable identifies a debtor Person; every Payable identifies a beneficiary Person, including taxes, utilities and direct entries. Origin parties must satisfy relevant business-role rules; flags never authorize scope.

Each Receipt belongs to exactly one Receivable; each Payment belongs to exactly one Payable. N valid settlements may abate the same title. Multiple selected titles produce one settlement per title. Receipts retain their same-debtor group; payments use a single atomic multi-selection action without a PaymentBatch, lot entity or beneficiary grouping. There is no installment-count ceiling on settlements and no compulsory installment sequence. Suggest overdue/oldest titles first but allow selection of future titles with balance.

ReceiptBatch requires one Person, Firm, direction, effective date and actual payment method and may span authorized origins; its optional proof may be shared, with individual or whole-group reversal. Payments may select any authorized Payables with balance in the same Firm, across beneficiaries and origins, without a same-Person check. One effective date and actual method entered in the UI are copied to each independent Payment. Do not create a PaymentBatch/lot or automatic beneficiary subgroups. Optional payment proof belongs to each Payment; never share a document disclosing other beneficiaries with Member. Reversal operates on the selected Payment events, not a persisted payment lot. Receipt grouping remains unchanged.

Selection checkbox enables an amount prefilled with remaining principal. Advanced adjustments expose principal abated P, discount D, interest J and penalty M. Effective cash C = P - D + J + M. All amounts are nonnegative; 0 <= D <= P; 0 < P <= locked outstanding principal; C must not be negative. Full discount (P=D, J=M=0) is valid with C=0, settles principal, and generates no remuneration. Interest/penalty are manual amounts, not automatic time-based accrual. Discount and adjustments require appropriate authority and reasons.

Example: title 100, P=50, D=5, J=2, M=0 → effective cash 47; balance 50. Financial screens must distinguish net cash received/paid, principal abated, discounts and charges. A discounted fully settled title can have cash lower than financial total; this is explained, not a discrepancy bug.

Amounts above the adjusted amount due are rejected; no customer/supplier credit ledger in this scope. A zero/negative principal allocation is rejected. Expected method on title may differ from actual method. Split Pix/cash requires separate receipt batches or payment confirmation actions. Settlement date may be today or earlier, never future. Use one explicit business date boundary (America/Sao_Paulo) consistently across client, server and reports.

Confirmation is 100% or nothing, INCLUDING title changes, settlement rows, derived remuneration obligations and audit. Revalidate authority and balances under transactional locking at commit. A concurrent balance change, denied title or remuneration failure rolls back every line. Retrying the same request must not duplicate money or commissions. Payment multi-selection retains request idempotency and audit correlation as technical metadata, not a user-managed lot or payment grouping entity. Reject repeated Payable IDs within one request; revalidate every selected title under locking, and roll back all Payments if any line fails.

## Corrections and reversals

Confirmed settlements are immutable monetary events: corrections are reversal with reason followed by a new settlement, not edit/delete/restore. Retain original record and separate reversal event/date. No undo or deletion of confirmed reversal; accidental reversal is corrected by a new settlement. Reverse principal, discounts, interest and penalty effects exactly once. Reverse cash on the reversal's actual date while preserving original settlement date. Never rewrite historical cash buckets.

Reversal immediately restores outstanding principal and derived partial/pending state, even on an operationally completed/cancelled contract. Statement shows original and reversal events. Group reversal is atomic across requested lines and validates downstream dependencies first.

Receipt reversal with generated remuneration Payables:
- If ANY corresponding remuneration has a valid Payment, block the receipt reversal. Reverse those payments first; do not generate compensation credit automatically.
- If none has valid payments, atomically reverse receipt and cancel corresponding generated Payables, preserving their calculation and adjustment history. New receipt creates new remuneration obligations.
- A fully discounted Payment is still a valid settlement and must be reversed before its source receipt; zero cash is not absence of settlement.

## Remuneration obligations

Only a confirmed, positive-effective-cash Receipt originating from a Contract Revenue can generate remuneration, and only if Gerar remunerações is enabled for the batch. Direct entries and other operational origins never implicitly generate it. No accrual on scheduling, generation, completion, or merely marking a title settled.

For each receipt allocation and eligible participant, create a separate Payable and a one-to-one RemunerationCalculation record. Preserve existing participation eligibility and percentage/business formulas unless explicitly changed by this contract; snapshot effective inputs and outcomes at event time. Base is TOTAL actual cash C, including manually entered interest/penalty and after discount. Do not use face value or principal alone. Preserve established percentage scales and rounding; regression-test current formula against target cash base. User can pay multiple obligations for different beneficiaries in one later atomic action, subject to each title authorization and the same-Firm/date/method rules, without payment grouping.

Calculation links Receipt, ContractAssignment and generated Payable with same Firm; preserves base, effective percentage, generation mode and rule inputs. Prevent duplicate generation for the same receipt/participation. Origin-specific columns do not accumulate in generic Payable. Auto-generated reason/notes explain the calculation but do not replace structured references.

Global analytics reuse existing values: LAWYER → PAYROLL_LAWYERS (Folha Advogados); ADMIN_ASSISTANT → PAYROLL_STAFF (Folha Funcionários). Existing code uses ADMIN_ASSISTANT; the conversation shorthand ADMIN_ASSIST is not a new lookup value.

Firm configures monthly remuneration cutoff and due day, defaults 25 and 5. Receipt dated on/before cutoff → due on configured day next month; after cutoff → due in the following month. For Oct 25 → Nov 5; Oct 26 → Dec 5. Snapshot computed date; later configuration changes do not rewrite existing titles. Dates absent from a month clamp to its last day. Use receipt effective date, not insertion timestamp, for this schedule.

Authorized adjustments may change generated Payable amount/date/analytic with justification and audit; original calculation remains immutable for comparison. Amount cannot fall below principal already abated. Interest, penalty and discounts also apply to remuneration Payments. No second Remuneration balance table remains.

## Queries and reporting

- Person statements expose receivable and payable balances separately within the current Firm and authorized scope; never net them or automatically offset obligations. Apply Member confidentiality before aggregation.
- Monthly future cash uses remaining principal by original title due date; overdue balances remain separately visible and are not dropped outside the selected month window. Unrealized manual charges are not projected before actually recorded.
- Realized cash uses settlement effective amounts at settlement date plus signed reversal cash at reversal date. Full discounts affect principal without cash. Never count Expense, Payable, calculation and Payment as four outflows.
- Financially settled Contract requires ALL active Revenues to have financial generation and all valid related Receivables settled. An ungenerated active Revenue prevents Quitado, even when current titles sum to zero. Operational status is independent.
- Origin dashboards distinguish reference, financial face total, principal abated, effective cash, discounts/charges, balance and cancelled titles. Standard summary uses clearly labelled totals; forecast uses balance, not original amount.
- Server-side deterministic pagination, stable lookup values and URL filters remain required. Counts, options, sums, exports, related links, notifications, audit and attachments apply the SAME scopes as detail reads.

## Roles, catalogs and evidence

See [Clerk catalog and scope](FINANCIAL_AUTHORIZATION.md). Member NEVER sees another collaborator's remuneration, including amounts inferred by totals, generated-title counts, batch membership, reports, exports, errors, history or attachments. Contract access does not grant that visibility.

Global catalogs: PersonType, EmployeeType, LegalArea, ContractStatus, AssignmentType, RevenueType, AttachmentType, FinancialAnalytic (evolution of ExpenseCategory), PaymentMethod and TitleKind (DOWN_PAYMENT/INSTALLMENT/EXTRA). Quitada/atraso are derived, not manually toggled lookup flags. PaymentMethod records expected versus actual selection. Catalogs have stable value, pt-BR label and active status; no Firm FK.

Contract and Expense retain attachments; Person evidence is shared; receipt batches retain optional shared settlement proof; each Payment owns its optional proof. Titles and calculations may retain contextual evidence under owner-authorized access. Private storage remains private; no broadened URL access. Audit retains reasons, actor, before/after and reversal/generation identity, while enforcing owner scope.

## Explicit exclusions and remaining verification

No real customer data exists. Rebuilding the intended disposable development database is allowed in the future implementation, but this documentation task performs no reset. No production migration/backfill or automatic historical entry receipt fabrication is required. Preserve current development baseline and seed replacement scenarios. No month/year competence field or competence-based reporting in this version. Forecast uses due date; realized cash uses effective settlement/reversal dates. Do not infer or backfill competence from due date. Payment on the due date is an expectation, never an automatic settlement; early (including partial), on-time and late settlements record their actual effective date, never a future date.

No external accounting/tax invoice integration, payroll module, inventory, interest accrual engine, credits or multi-analytic allocation.

Verify Clerk production plan/role/custom-permission limits before provider configuration. User requests only Member/Admin as production design; a temporary development role is optional. No live Clerk changes authorized by writing proposals. Specific provider limits are UNVERIFIED, not a claimed fact. Implementation must resolve technical origin FK layout, concurrency/idempotency mechanism and exact UI labels within these approved semantics; record decisions without silently changing business rules.

## Decision traceability and acceptance

The [decision register](FINANCIAL_DECISIONS.md) records all 51 approved answers. The [test matrix](../implementation/FINANCIAL_TEST_MATRIX.md) maps them to implementation evidence. Title face values are positive decimal currency amounts; settlement principal is strictly positive, although effective cash may be zero for an authorized full discount. Do not use floating point for persisted arithmetic.

## Separate registration screens over shared Person

The frontend SHALL retain separate Clientes, Fornecedores and Colaboradores screens and sidebar entries, each exposing only its contextual fields/actions under explicit permissions. Do not replace them with a single generic Pessoas menu. They project the same global Person: cumulative customer/supplier/employee roles do not duplicate identity or documents. Authorized collaborator management exposes EmployeeProfile type, applicable OAB, remuneration/referral percentages and access binding. Existing calculation snapshots are never recalculated by a profile percentage edit.

Member SHALL NOT access supplier or collaborator management, including routes, APIs, options, counts, exports, profile fields and compensation percentages. Customer access remains limited to assigned-contract scope. A shared Person readable as customer SHALL NOT serialize its EmployeeProfile, other role flags, access settings or privileged relationships. This restriction does not remove already-approved own-remuneration access or the permitted team participation display inside assigned contracts; neither grants collaborator-directory access. Hiding sidebar entries alone is insufficient.

## Contract dimensions in financial analysis

Title lists and financial reports SHALL support filters and grouping by contract LegalArea, RevenueType and collaborator AssignmentType, in addition to the title FinancialAnalytic. These are origin-derived dimensions, not extra generic-title classification columns or new analytic catalogs.

- Receivable: resolve Revenue and its Contract for revenue type/legal area. AssignmentType filters use existence of a matching authorized ContractAssignment on that Contract, not a join that multiplies title rows.
- Remuneration Payable: resolve RemunerationCalculation to its exact ContractAssignment for assignment type, and its source Receipt/Receivable/Revenue/Contract for revenue type and legal area. Do not attribute it to all participants on the contract.
- Receipt/Payment and their reversals inherit these dimensions through their title/calculation relationships. Counts, outstanding principal and realized cash keep their existing distinct monetary bases and date rules.
- Expense-origin and direct titles have no contract dimensions; expose a distinct pt-BR “Sem vínculo com contrato” group/filter, not fabricated contract values. Remuneration adjustments retain their structured origin.
- Multi-select values within a dimension use OR; different dimensions use AND. Use stable lookup identifiers/values and existing URL/Zod/query contracts. Apply Firm, action, assigned-contract and beneficiary scope BEFORE options, totals, grouping, pagination and export.
- A Receivable may match several AssignmentTypes. Count it once in filtered rows and grand totals, even when several assignments match. When grouping by AssignmentType, count each title/event once per distinct type and label groups as overlapping/non-additive: the same amount may occur in multiple type groups, so never sum those groups to derive the grand total or infer collaborator remuneration. No proportional allocation is introduced. Remuneration Payables have the single type of their exact source assignment.
- Use the existing origin lookup relationships for dimension labels and classification; this is not a new immutable historical dimension snapshot. Remuneration monetary calculation snapshots remain immutable. A Member cannot use any dimension, options, counts, exports or drilldown to discover another collaborator's remuneration, profile settings or otherwise forbidden directory data.

Example: remuneration Payable may be FinancialAnalytic “Folha Advogados”, LegalArea “Trabalhista”, RevenueType “Judicial” and its source AssignmentType “Responsável”. These filters do not alter balances or remuneration formulas.
