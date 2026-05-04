## Why

O dashboard ja mostra um chart de evolucao financeira, mas os blocos `Receita por área` e `Receita por tipo` ainda aparecem apenas como listas com barra de progresso. Isso reduz leitura comparativa e participacao visual justamente nas duas quebras que ajudam o escritorio a entender de onde a receita esta vindo.

## What Changes

- Replace the static breakdown list for `Receita por área` with a chart optimized for ranking and comparison between legal areas.
- Replace the static breakdown list for `Receita por tipo` with a chart optimized for share-of-total reading between revenue types.
- Preserve the current role scope, active filters, totals, percentages, and pt-BR empty-state behavior while changing the presentation layer.

## Non-goals

- No change to dashboard permissions, filters, route structure, or data aggregation semantics.
- No new analytics route, drill-down workflow, or export behavior.
- No change to the existing financial evolution chart, metric cards, or recent activity feed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard`: dashboard summaries now include visual chart rendering for legal-area and revenue-type revenue breakdowns instead of progress-only list blocks.

## Impact

- Affected code: `src/features/dashboard/components/*` and related dashboard tests.
- UI dependency impact: reuse the existing shared chart UI boundary under `@/shared/components/ui`.
- User roles: administrators and regular users keep the same scoped data; only presentation changes.
- Multi-tenant impact: breakdown charts continue to reflect only firm-scoped and role-authorized data already returned by the dashboard summary query.
