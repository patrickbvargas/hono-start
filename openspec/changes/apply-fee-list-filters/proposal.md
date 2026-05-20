## Why

Fees ainda usa `FilterPopover`, diferente do padrão novo de `clients` e `contracts`. Isso mantém inconsistência em filtros avançados, feedback visual de estado ativo e experiência mobile.

## What Changes

- Migrar a UI de filtros de `fees` para `ListFilters`.
- Preservar busca inline por processo e manter filtros estruturados em superfícies avançadas responsivas.
- Exibir chips para filtros ativos e ação clara de limpeza, convergindo o comportamento com as listas de referência.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fee-management`: filtros da lista de honorários passam a usar o padrão compartilhado `ListFilters` com drawer mobile, resumo de filtros ativos e limpeza consistente.

## Impact

- Código afetado em `src/features/fees/components/filter`, `src/features/fees/hooks/use-filter` e testes relacionados.
- Nenhuma mudança de API, persistência, autorização ou dependência externa.
