## Context

The system recently separated the operational dashboard from the financial overview dashboard (`/visao-financeira`). The operational dashboard has a comprehensive drilldown system allowing users to drill down into metrics, charts, tables, and aging breakdowns. The financial overview now needs the exact same drilldown capability, style, and responsiveness, adapted to treasury metrics (realized receipts, realized payments, projected open receivables, projected open payables).

## Goals / Non-Goals

**Goals:**
- Provide 100% drilldown coverage on `/visao-financeira`: 4 metric cards, monthly cash flow chart bars, 3 breakdown cards, and all cash flow table value cells.
- Guarantee invariant: Drilldown modal total sum MUST strictly equal the clicked element's amount.
- Reuse `@/features/drilldown` generic component and `RelatedRecordActions` for consistent UX and keyboard accessibility.
- Support both "Registros" (detailed records table with sorting and context actions) and "Visão Geral" (multi-dimensional grouped bars) tabs.
- Strictly enforce `org:financial_overview:read_all` (with fallback `org:cash_flow:read_all`, `org:payables:read_all`) on server function.

**Non-Goals:**
- Allowing editing or deleting records directly inside drilldown modal (read-only with navigation to detail overlay).
- Changing business calculation logic of financial summary or operational overview.

## Decisions

### 1. Unified Selection Schema & Discriminated Union
Define `financialDrilldownSelectionSchema` in `src/features/financial-overview/schemas/drilldown.ts` with discriminated union on `kind`:
- `kind: "metric"`: `value: "realized_balance" | "projected_balance" | "receivables" | "payables"`
- `kind: "monthly"`: `month: string`, `series: "entryRealized" | "entryProjected" | "entryTotal" | "outputRealized" | "outputProjected" | "outputTotal" | "balanceRealized" | "balanceTotal" | "administrative" | "judicial" | "succumbency" | "remunerationPaid" | "expensePaid"`
- `kind: "aging"`: `value: "Até 30 dias" | "31–60 dias" | "61–90 dias" | "Acima de 90 dias"`
- `kind: "forecast"`: `value: "Próximos 30 dias" | "31–60 dias" | "61–90 dias"`
- `kind: "category"`: `value: string`

*Rationale*: Strongly typed discriminators allow exhaustiveness checks, clean type narrowing, and simple query key hashing.

### 2. Projection Engine for Exact Sum Matching
In `src/features/financial-overview/data/drilldown.ts`, reuse `getFinancialOverviewRecords(scope)` and `getCashEvents` / `getOutstanding`:
- For realized metrics / series: map cash movements (receipts = positive, payments = negative).
- For open / projected metrics / series: map open titles (open receivables = positive, open payables = negative).
- For `projected_balance`: combine realized cash movements within filter period with all open projected titles as calculated by `buildFinancialOverviewSummary`.
- Apply negation to output amounts when calculating net results so that the sum arithmetic matches the card/cell value exactly.

### 3. Dimensional Overview Grouping
In `buildFinancialDrilldownOverview`:
- Extract relevant dimensions based on the rows returned:
  - `analytic`: Analítica Financeira
  - `type`: Tipo de Receita (Administrativo, Judicial, Sucumbência)
  - `counterparty`: Cliente / Fornecedor / Beneficiário
  - `kind`: Movimento (Recebimento, Pagamento, Parcela Aberta)

### 4. Reusing Shared Table and Bar Shape Patterns
- Use `TableButton` with `variant="hover"` for table cells in `CashFlowTable`.
- Use `DrilldownBarShape` in `CashFlowChart` and `BreakdownCard` to handle SVG focus, hover styles, and keyboard accessibility (`Enter`/`Space`).

## Risks / Trade-offs

- [Risk: Rounding discrepancies in cents between summary and drilldown items] → Mitigation: Perform sum using Prisma.Decimal or integer cents before returning, matching the exact logic used in `buildFinancialOverviewSummary`.
- [Risk: Large volume of movements in drilldown query] → Mitigation: `getFinancialOverviewRecords` applies firm-scoped transaction and indexed queries (`dueDate`, `firmId`). Drilldown uses TanStack Table virtual scroll and pagination.
