## Why

Dashboard ainda usa `FilterPopover`, diferente do padrão compartilhado que já começou a convergir em listas como `clients` e `contracts`. Ao mesmo tempo, o dashboard tem uma particularidade importante: os atalhos de período inline fazem parte da experiência principal e não devem ser substituídos por um fluxo genérico.

## What Changes

- Migrar a superfície avançada de filtros do dashboard para o padrão compartilhado `ListFilters`.
- Preservar os atalhos de período inline exatamente como existem hoje.
- Manter o filtro inline de colaborador para administradores e os filtros secundários em superfície avançada responsiva.
- Exibir resumo claro de filtros avançados ativos sem alterar a semântica dos atalhos de período.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard`: a superfície avançada de filtros do dashboard passa a usar o padrão compartilhado `ListFilters`, preservando os atalhos de período inline e seu comportamento atual.

## Impact

- Código afetado em `src/features/dashboard/components/filter`, `src/features/dashboard/hooks/use-filter` e testes relacionados.
- Nenhuma mudança de API, persistência, cálculos analíticos ou regras de permissão.
