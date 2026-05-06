## Why

Dashboard hoje entra com `Spinner` genérico no pending inicial da rota autenticada. Isso quebra leitura espacial da tela principal do produto, causa salto visual quando dados chegam, e não atende pedido de skeleton pixel perfect alinhado ao layout final.

## What Changes

- Adicionar skeleton estrutural próprio para pending inicial do dashboard.
- Fazer skeleton espelhar header/filter area e superfícies analíticas reais: cards métricos, gráfico de evolução, tabela mensal de remuneração e breakdowns.
- Garantir que placeholders respeitem alturas, gaps, wrappers `Card`, scroll interno e comportamento responsivo já usados pela tela final.
- Substituir `pendingComponent` do dashboard para usar skeleton dedicado em vez de `RouteLoading`.
- Cobrir contrato visual e estrutural com testes focados em shape e wiring da rota.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard`: dashboard passa a renderizar skeleton estrutural dedicado durante o pending inicial da rota, preservando layout final e evitando regressão visual no carregamento.

## Impact

- Feature dashboard em `src/features/dashboard/components/*`.
- Rota autenticada home em `src/routes/_app/index.tsx`.
- Possível novo shared/feature component para skeleton, mantendo boundary de UI via `@/shared/components/ui`.
- Testes de contrato e render da feature dashboard.
