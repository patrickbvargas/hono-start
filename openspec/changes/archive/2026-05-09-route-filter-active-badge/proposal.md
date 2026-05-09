## Why

Os filtros de lista já usam URL state como fonte de verdade, mas hoje o gatilho `Filtros` não sinaliza quando há critérios avançados ativos. Isso reduz descobribilidade, dificulta entender o estado atual da rota e aumenta a chance de operar em uma lista filtrada sem perceber.

## What Changes

- Adicionar um indicador visual opcional no botão que abre o popover de filtros avançados.
- Fazer o indicador aparecer quando algum campo controlado pelo popover estiver com valor diferente do default validado da rota.
- Manter campos inline fora do popover, como busca principal, fora desse indicador para evitar sinal ambíguo.
- Aplicar o comportamento nas superfícies que já usam `FilterPopover` com URL state validado.
- Preservar a possibilidade de ativar ou desativar o indicador por props para usos futuros.

## Non-goals

- Não adicionar contagem numérica de filtros ativos.
- Não alterar a semântica de URL state, defaults, serialização, ou canonicalização de search params.
- Não mudar o layout dos campos de filtro entre inline e popover.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `audit-log-management`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.
- `client-management`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.
- `contract-management`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.
- `dashboard`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.
- `employee-filter-ui`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.
- `fee-management`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.
- `remuneration-management`: o gatilho de filtros avançados passa a indicar quando filtros do popover estão ativos.

## Impact

- Affected code: `src/shared/components/filter-popover.tsx`, `src/shared/hooks/use-filter.ts`, hooks and filter components that consume `FilterPopover`.
- Affected UX: authenticated list and dashboard routes with advanced filter popovers.
- Dependencies/APIs: no external dependency changes; existing validated route search state remains authoritative.
- Roles and tenancy: no permission or tenant-scope changes; behavior only reflects already-active route state.
