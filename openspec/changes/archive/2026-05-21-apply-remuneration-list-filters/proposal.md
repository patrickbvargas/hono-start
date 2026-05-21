## Why

Remunerations ainda usa `FilterPopover`, diferente das listas já migradas para `ListFilters`. Isso mantém inconsistência visual e dificulta convergência de UX entre filtros avançados de telas financeiras.

## What Changes

- Migrar a UI de filtros de `remunerations` para `ListFilters`.
- Preservar busca inline e filtros estruturados por colaborador, contrato e período.
- Exibir chips para filtros ativos e ação clara de limpeza, mantendo comportamento consistente entre admin e usuário comum.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `remuneration-management`: filtros da lista de remunerações passam a usar o padrão compartilhado `ListFilters` com responsividade, resumo de filtros ativos e limpeza consistente.

## Impact

- Código afetado em `src/features/remunerations/components/filter`, `src/features/remunerations/hooks/use-filter` e testes relacionados.
- Nenhuma mudança de API, persistência, autorização ou dependência externa.
