## Why

The Financial Overview dashboard (`/visao-financeira`) currently renders metrics, monthly cash flow charts, aging/forecast breakdowns, and a monthly cash flow table without drilldown capabilities. Users cannot inspect the underlying financial records (titles, receipts, payments) that compose each metric, bar, or cell, unlike the Operational Dashboard (`/visao-operacional`) which provides full drilldown modals, row actions, and multi-dimensional grouping.

Adding drilldown to Financial Overview brings feature parity, full auditability of treasury numbers, and direct access to underlying titles and cash movements while preserving strict multi-tenant isolation and financial role permissions.

## What Changes

- Enable click interactions on all 4 Financial Metric cards (`Saldo Realizado`, `Saldo Projetado`, `Total a Receber`, `Total a Pagar`).
- Enable interactive bar shapes on the Monthly Cash Flow chart (`CashFlowChart`) for realized and projected entries and outputs.
- Enable interactive bar shapes on the 3 breakdown cards (`Títulos em atraso`, `Títulos a vencer`, `Pagamentos por analítica`).
- Enable interactive table cells via `TableButton` on the Monthly Cash Flow Statement table (`CashFlowTable`).
- Introduce `useFinancialDrilldown` hook and `FinancialDrilldownModal` reusing the unified `@/features/drilldown` engine with matching design and keyboard accessibility.
- Implement server-side drilldown endpoint `getFinancialOverviewDrilldownFn` and data engine `getFinancialOverviewDrilldown` guaranteeing that the aggregated drilldown sum strictly matches the clicked metric or cell amount.
- Include modal tabs:
  - **Registros**: dynamic columns (Vencimento/Data, Movimento, Referência/Beneficiário/Devedor, Analítica/Tipo, Processo/Contrato, Valor, Ações contextuais via `RelatedRecordActions`).
  - **Visão Geral**: multi-dimensional aggregation cards (Analítica, Tipo de Título/Receita, Cliente/Beneficiário) adapted to financial context.
- Support row-level click and context menu to inspect related records (`receivable`, `payable`, `expense`, `contract`).

## Capabilities

### Modified Capabilities
- `financial-overview`: Add comprehensive drilldown capabilities across metric cards, monthly evolution chart, breakdown cards, and monthly cash flow table with exact sum verification, dimensional overview, and contextual navigation to related records.

## Non-goals
- Modifying Operational Overview (`/visao-operacional`) or its underlying data projection.
- Allowing Member role users without `org:financial_overview:read_all` to access financial treasury drilldowns.
- Adding in-place editing or deletion from the drilldown table (actions link to existing drawers/modals).

## Impact
- Frontend: `src/features/financial-overview/components/` (metric cards, chart, breakdown card, table, new drilldown folder), `src/features/financial-overview/hooks/`, `src/features/financial-overview/schemas/`.
- Backend/Data: `src/features/financial-overview/api/queries.ts`, `src/features/financial-overview/data/drilldown.ts`.
- Permissions: Enforced with `org:financial_overview:read_all` (with fallback `org:cash_flow:read_all`, `org:payables:read_all`).
