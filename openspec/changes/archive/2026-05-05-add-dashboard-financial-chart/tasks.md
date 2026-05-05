## 1. Shared UI and dependencies

- [x] 1.1 Add the `recharts` runtime dependency required by the shared chart pattern.
- [x] 1.2 Add `src/shared/components/ui/chart.tsx` and export its public API through the shared UI barrel.

## 2. Dashboard data and filters

- [x] 2.1 Extend dashboard filter/search schemas and defaults with `legalArea` and `revenueType`.
- [x] 2.2 Reuse route-facing contract lookup query options so the dashboard filter can load legal-area and revenue-type options.
- [x] 2.3 Extend dashboard summary data mapping to return monthly financial evolution buckets for receitas and remuneracoes under role-scoped and firm-scoped filters.

## 3. Dashboard UI

- [x] 3.1 Update the dashboard filter popover to render legal-area and revenue-type controls alongside the existing period and employee filters.
- [x] 3.2 Render a shared-UI-based grouped column chart for monthly receita and remuneracao evolution, including pt-BR labels, tooltip, legend, and empty-state behavior.

## 4. Verification

- [x] 4.1 Update and add dashboard tests covering new filters, shared lookups, and monthly aggregation behavior.
- [x] 4.2 Run `pnpm check`.
- [x] 4.3 Run `npx tsc --noEmit`.
