## Why

O dashboard atual mostra cards, comparativos pontuais e breakdowns, mas ainda nao permite acompanhar a evolucao mensal de receitas e remuneracoes ao longo de um periodo filtrado. Isso reduz a capacidade de analise operacional e financeira, especialmente para administradores que precisam comparar tendencias por colaborador, area contratual e tipo de receita.

## What Changes

- Add charted dashboard trend data for receitas and remuneracoes grouped by ano e mes dentro do periodo filtrado.
- Expand dashboard filters with contract legal area and revenue type while preserving URL-driven state.
- Reuse role-scoped dashboard visibility so administrators can filter firm-wide data and regular users remain limited to assigned-contract and own-remuneration scope.
- Introduce shared chart UI support through the existing shared shadcn/ui boundary using Recharts composition.

## Non-goals

- No change to dashboard permissions, export behavior, or underlying remuneration formulas.
- No new standalone analytics route or drill-down workflow.
- No change to existing cards, recent activity semantics, or contract/fee/remuneration business rules beyond applying the new filters consistently.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard`: expand dashboard filtering and summaries to include legal-area and revenue-type filters plus a monthly financial evolution chart for receitas and remuneracoes.
- `shared-ui-vendor-boundary`: extend the shared UI layer to expose the chart component pattern required for feature-owned chart composition without importing vendor UI primitives directly from the dashboard feature.

## Impact

- Affected code: `src/features/dashboard/*`, `src/routes/_app/index.tsx`, and `src/shared/components/ui/*`.
- Data/query impact: dashboard summary query must aggregate monthly revenue and remuneration values by validated filter scope.
- Dependency impact: add `recharts` to support the shared `chart` component implementation.
- User roles: administrators gain extra filter controls; regular users keep scoped visibility and do not gain broader access.
- Multi-tenant impact: all new filters and chart aggregates remain firm-scoped and session-authoritative.
