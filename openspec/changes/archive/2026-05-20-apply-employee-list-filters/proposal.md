## Why

Employees ainda usa `FilterPopover`, enquanto `clients` e `contracts` já convergiram para `ListFilters`. Essa diferença mantém drift visual, de responsividade e de manutenção em uma lista equivalente.

## What Changes

- Migrar a UI de filtros de `employees` para `ListFilters`.
- Manter busca inline por nome ou OAB e mover filtros avançados para popovers no desktop e drawer no mobile.
- Exibir chips para filtros ativos e ação clara de limpeza, alinhando o comportamento ao padrão já adotado nas listas de referência.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `employee-filter-ui`: filtros de colaboradores passam a usar o padrão compartilhado `ListFilters` com responsividade, resumo de filtros ativos e limpeza consistente.

## Impact

- Código afetado em `src/features/employees/components/filter`, `src/features/employees/hooks/use-filter` e testes relacionados.
- Nenhuma mudança de API, persistência, autorização ou dependência externa.
