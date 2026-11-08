## 1. Schemas & Types

- [x] 1.1 Create `src/features/financial-overview/schemas/drilldown.ts` with selection discriminated union, row schema, and result schema.
- [x] 1.2 Create `src/features/financial-overview/schemas/drilldown-overview.ts` with dimensional grouping schema.

## 2. Data Layer & Server Function

- [x] 2.1 Implement `src/features/financial-overview/data/drilldown.ts` projecting financial records to matching rows with exact sum parity.
- [x] 2.2 Register `getFinancialOverviewDrilldownFn` and `getFinancialOverviewDrilldownQueryOptions` in `src/features/financial-overview/api/queries.ts`.

## 3. Drilldown UI Components & Hooks

- [x] 3.1 Implement `src/features/financial-overview/hooks/use-drilldown.ts` and `hooks/use-drilldown-overview.ts`.
- [x] 3.2 Create `src/features/financial-overview/components/drilldown/bar-shape.tsx`, `columns.tsx`, `summary.tsx`, `overview.tsx`, and `modal.tsx`.

## 4. Trigger Integrations & Page Wiring

- [x] 4.1 Update `src/features/financial-overview/components/cards/metric-cards.tsx` to enable click trigger overlays on all 4 metric cards.
- [x] 4.2 Update `src/features/financial-overview/components/chart/cash-flow-chart.tsx` with interactive bar shapes on realized and projected series.
- [x] 4.3 Update `src/features/financial-overview/components/breakdown/breakdown-card.tsx` with interactive bar shapes on aging, forecast, and expense categories.
- [x] 4.4 Update `src/features/financial-overview/components/table/cash-flow-table.tsx` to add `TableButton` on all numeric data cells.
- [x] 4.5 Wire `useFinancialDrilldown` and `FinancialDrilldownModal` in `src/features/financial-overview/components/index.tsx` and update public exports.

## 5. Verification & Tests

- [x] 5.1 Create unit tests in `src/features/financial-overview/__tests__/financial-drilldown.test.ts` verifying selections, calculations, and sum parity.
- [x] 5.2 Run tests (`pnpm test`), type check (`npx tsc --noEmit`), and linter (`pnpm check`) ensuring zero regressions.
