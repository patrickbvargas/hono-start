## Why

O dashboard atual ajuda na leitura analitica, mas nao atende a necessidade operacional de pagamento de remuneracoes por colaborador. Hoje existe visao temporal agregada e breakdowns de receita, porem nao existe um quadro consolidado que mostre quanto cada colaborador recebeu em cada mes dentro do periodo filtrado. Isso dificulta comparar meses, conferir valores antes do pagamento e transformar o dashboard em um ponto de apoio real para a operacao financeira.

Ao mesmo tempo, a lista de "Ultimas atualizacoes" ocupa espaco nobre do dashboard com informacao menos critica para esse fluxo. O pedido e substituir apenas esse bloco por uma tabela mensal de remuneracao por colaborador, preservando os demais cards e graficos existentes.

## What Changes

- Remove the recent activity panel from the dashboard.
- Add a dashboard remuneration table using the shared `DataTable` pattern.
- Group remuneration values by collaborator and by month within the active dashboard period.
- Keep the remaining dashboard cards and charts unchanged.
- Require all dashboard cards, charts, and tables to use the shared shadcn/ui `Card` wrapper for visual consistency.
- Preserve role-scoped visibility so administrators can see firm-wide data and regular users remain limited to their own dashboard scope.

## Non-goals

- No change to dashboard cards, revenue charts, or the financial evolution chart.
- No change to remuneration formulas, fee generation rules, or manual override behavior.
- No change to the standalone remunerations route, export flows, or payment workflows outside the dashboard.
- No chart replacement for this new requirement in the first iteration; the new surface is table-only for operational clarity.

## Capabilities

### Modified Capabilities

- `dashboard`: replace recent activity with a monthly remuneration-by-collaborator table driven by the current dashboard filters and role scope.

## Impact

- Affected code: `src/features/dashboard/*` and `src/routes/_app/index.tsx`.
- Data/query impact: dashboard summary query must aggregate remuneration totals by employee and by calendar month for the selected period.
- UI impact: dashboard layout keeps existing cards/charts and swaps the recent activity card for a horizontally scrollable `DataTable`.
- User roles: administrators keep firm-wide visibility; regular users continue to see only their own scoped remuneration data.
- Multi-tenant impact: all table rows and month totals remain restricted to the authenticated firm and session-derived visibility.
