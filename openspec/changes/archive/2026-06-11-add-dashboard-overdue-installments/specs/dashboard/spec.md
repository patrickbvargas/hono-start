## MODIFIED Requirements

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, revenue grouping by legal area and revenue type, a monthly financial evolution chart, a monthly remuneration table by collaborator, and an overdue-installments table for revenues whose expected installment schedule is behind the recorded active fee installments, with supported summaries reflecting the active dashboard period and employee filters. The monthly remuneration table SHALL also expose a subtotal row for the visible monthly buckets, derived from the same filtered and role-scoped remuneration set shown in the table. For administrators, the dashboard SHALL also show a read-only cash-flow summary composed of saldo total, a monthly saldo chart, and a monthly cash-flow table derived from entradas, remunerações, and despesas. In this context, `entrada` means received honorários, `saída` means `remunerações + despesas`, and `saldo` means `entrada - saída`. The monthly cash-flow table SHALL break down entradas by the canonical revenue types `Administrativo`, `Judicial`, and `Sucumbência`, then show derived `Entrada`, `Remuneração`, `Despesa`, `Saída`, and `Saldo` columns for each visible month. The overdue-installments table SHALL derive each expected installment `n` from `paymentStartDate + n meses`, compare that expected schedule against active `Fee.installmentNumber` values for the same revenue, and list each installment that is already due but still has no active fee record. The main dashboard content SHALL scroll inside a shared scroll container without clipping card borders, and the breakdown legend SHALL present concise participation percentages without redundant phrasing. The dashboard SHALL NOT render the "Visão da firma" badge. The root dashboard component SHALL compose dedicated analytical surface components for metric cards, charts, and remuneration tables instead of concentrating all surface implementations inline.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, legal-area revenue grouping, revenue-type grouping, monthly financial evolution for receitas and remuneracoes, a monthly remuneration table by collaborator, and an overdue-installments table
- **AND** the dashboard does not display the recent activity list

#### Scenario: Administrator loads cash-flow summaries
- **WHEN** an administrator loads dashboard data
- **THEN** the system displays a read-only saldo total card, a monthly saldo chart, and a monthly cash-flow table
- **AND** those surfaces are derived from honorários recebidos, remunerações, and despesas inside the authenticated firm

#### Scenario: Regular user does not receive cash-flow surfaces
- **WHEN** a regular user loads dashboard data
- **THEN** the system does not render the cash-flow card, cash-flow chart, or monthly cash-flow table
- **AND** the user does not infer firm-wide despesas or saldo through derived dashboard values

#### Scenario: Dashboard loads filtered summaries
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to dashboard datasets whose dates, contract areas, revenue types, or employee relationships are relevant to the selected filter

#### Scenario: Cash-flow filters apply only to relevant datasets
- **WHEN** dashboard filters are active on the administrator cash-flow surfaces
- **THEN** the selected period filters all cash-flow datasets by month
- **AND** legal-area and revenue-type filters affect only entries and remunerations related to matching contract data
- **AND** standalone despesas remain included by date even though they do not belong to a legal area or revenue type

#### Scenario: Dashboard loads filtered remuneration table
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to the monthly remuneration table wherever dates or employee relationships are relevant to the selected filter

#### Scenario: Dashboard chart spans monthly buckets
- **WHEN** dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups the financial evolution chart by ano e mes
- **AND** the chart exposes separate monthly values for receitas and remuneracoes

#### Scenario: Dashboard cash-flow chart spans monthly buckets
- **WHEN** administrator dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups the cash-flow chart by ano e mes
- **AND** the chart exposes one monthly saldo value for each visible month in the selected range
- **AND** months without movement remain present with zero saldo

#### Scenario: Dashboard remuneration table spans monthly buckets
- **WHEN** dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups remuneration values by collaborator and by ano e mes
- **AND** the table exposes one row per collaborator and one column per month in the selected range
- **AND** each month column label uses the short `Mes/aa` format, such as `Jan/26`

#### Scenario: Dashboard cash-flow table spans monthly buckets
- **WHEN** administrator dashboard data is loaded for a period spanning multiple months
- **THEN** the monthly cash-flow table exposes one row per visible month in the selected range
- **AND** each row shows `Administrativo`, `Judicial`, `Sucumbência`, `Entrada`, `Remuneração`, `Despesa`, `Saída`, and `Saldo`

#### Scenario: Dashboard overdue-installments table lists due missing installments
- **WHEN** dashboard data is loaded for a revenue whose expected installment count is greater than the active fee installment numbers already recorded
- **THEN** the overdue-installments table lists one row for each due installment number that still has no active fee record
- **AND** each row includes the contract, client, responsible collaborator context, revenue type, installment number, due date, and related revenue totals needed for review

#### Scenario: Dashboard overdue-installments table respects role scope
- **WHEN** a regular user loads the dashboard
- **THEN** the overdue-installments table includes only revenues from contracts visible to that user
- **AND** the table does not expose firm-wide contract data outside the authenticated scope

#### Scenario: Dashboard overdue-installments table respects active filters
- **WHEN** dashboard filters are active
- **THEN** the overdue-installments table includes only due installments belonging to revenues and contracts that match the active period, legal-area, revenue-type, and role scope rules

#### Scenario: Filtered period contains months without movement
- **WHEN** the selected dashboard period includes one or more months without matching receitas or remuneracoes
- **THEN** the system keeps those months in the financial evolution series with zero values

#### Scenario: Cash-flow period contains months without movement
- **WHEN** the selected dashboard period includes one or more months without matching entradas, remunerações, or despesas
- **THEN** the system keeps those months in the cash-flow chart and table with zero values for every derived cash-flow field

#### Scenario: Filtered period contains months without collaborator movement
- **WHEN** the selected dashboard period includes one or more months without matching remunerations for a collaborator already present in the result
- **THEN** the system keeps those month columns in the table
- **AND** the collaborator row shows zero values for those months

#### Scenario: Dashboard remuneration table includes period total
- **WHEN** the monthly remuneration table is displayed
- **THEN** the system shows a total-in-period value for each collaborator based on the visible monthly buckets

#### Scenario: Dashboard remuneration table includes monthly subtotals
- **WHEN** the monthly remuneration table is displayed with one or more visible collaborator rows
- **THEN** the system shows one subtotal value for each visible month column
- **AND** each subtotal equals the sum of that month's visible collaborator values after role and filter scoping
- **AND** the subtotal row also shows a total-in-period equal to the sum of the visible monthly subtotals

#### Scenario: Cash-flow totals remain arithmetically consistent
- **WHEN** the administrator cash-flow table is displayed
- **THEN** `Entrada` equals the sum of `Administrativo`, `Judicial`, and `Sucumbência` for the row month
- **AND** `Saída` equals `Remuneração + Despesa`
- **AND** `Saldo` equals `Entrada - Saída`

#### Scenario: Breakdown charts preserve values
- **WHEN** the dashboard renders legal-area or revenue-type breakdowns
- **THEN** each visualization reflects the same formatted totals and participation percentages returned by the active dashboard summary payload
- **AND** the supporting legend shows each participation value as a concise percentage label

#### Scenario: Dashboard analytical surfaces use shared card wrapper
- **WHEN** the dashboard renders metric cards, charts, or the monthly remuneration table
- **THEN** each analytical surface uses the shared shadcn/ui `Card` component as its outer visual wrapper

#### Scenario: Dashboard analytical surfaces stay componentized
- **WHEN** the dashboard renders metric cards, charts, the monthly remuneration table, and the overdue-installments table
- **THEN** the root dashboard component composes dedicated child components for those analytical surfaces
- **AND** metric-card rendering details remain inside the metric-cards component

#### Scenario: Dashboard scroll stays inside content region
- **WHEN** dashboard content exceeds the available wrapper body height
- **THEN** the dashboard scrolls within a shared scroll container inside the wrapper body
- **AND** chart and card borders remain fully visible while scrolling

#### Scenario: Regular user opens dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the monthly remuneration table shows only the authenticated user's own scoped remuneration data
- **AND** the subtotal row reflects only that same scoped data

#### Scenario: No business records match filters
- **WHEN** the dashboard has no matching business records for the active filters
- **THEN** the system displays zero-value summaries, zeroed chart buckets, and empty-state copy in pt-BR

#### Scenario: No remuneration records match filters
- **WHEN** the dashboard has no matching remuneration records for the active filters
- **THEN** the system displays zero-value summaries as applicable
- **AND** the monthly remuneration table shows an empty-state message in pt-BR
- **AND** the system does not render a subtotal row without visible collaborator rows

#### Scenario: No overdue installments match filters
- **WHEN** no due installments remain without active fee records for the current dashboard scope
- **THEN** the overdue-installments table shows an empty-state message in pt-BR
- **AND** the system does not invent placeholder overdue rows

#### Scenario: No cash-flow records match filters
- **WHEN** an administrator dashboard period has no matching entradas, remunerações, or despesas
- **THEN** the system shows zero saldo in the cash-flow card
- **AND** the chart and table remain structurally visible with zeroed monthly values

#### Scenario: No breakdown values exist
- **WHEN** the dashboard summary contains no received revenue for legal-area and revenue-type breakdowns
- **THEN** the system shows pt-BR empty-state copy in both breakdown cards instead of rendering misleading chart segments or bars

#### Scenario: No business records exist
- **WHEN** the dashboard has no matching business records
- **THEN** the system displays zero-value summaries, zeroed chart buckets, and empty-state copy in pt-BR

#### Scenario: Current-year dashboard omits future months
- **WHEN** an authenticated user applies the current-year shortcut during an in-progress calendar year
- **THEN** the dashboard summaries, monthly financial evolution, monthly remuneration table, and overdue-installments table use only months from January through the current month
- **AND** the system does not append future months from the same year as zero-value buckets
