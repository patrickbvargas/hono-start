## Why

O filtro de `contracts` ainda usa `FilterPopover`, enquanto `clients` já adotou `ListFilters` como padrão compartilhado para busca inline, filtros avançados responsivos e chips de filtros ativos. Essa diferença aumenta drift visual e de manutenção entre listas equivalentes.

## What Changes

- Substituir a UI de filtros da lista de contratos pelo padrão compartilhado `ListFilters`.
- Manter a busca por processo/cliente inline e mover filtros avançados para `popover` no desktop e `drawer` no mobile.
- Exibir chips para filtros ativos e ação clara de limpeza, alinhando o comportamento de contratos ao fluxo já usado em clientes.
- Adicionar cobertura focada para o hook de filtros de contratos.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contract-management`: contratos passam a expor o mesmo padrão compartilhado de filtros ativos, limpeza e responsividade já adotado por outras listas de entidades.

## Impact

- Código afetado em `src/features/contracts/components/filter`, `src/features/contracts/hooks/use-filter` e testes do slice.
- Nenhuma mudança de API, persistência, autorização ou dependência externa.
