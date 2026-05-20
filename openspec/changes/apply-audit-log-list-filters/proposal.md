## Why

Audit logs ainda usa `FilterPopover`, enquanto outras listas já caminham para `ListFilters`. Essa diferença mantém drift em uma tela list-driven que também depende de filtros avançados e URL state.

## What Changes

- Migrar a UI de filtros de `audit-logs` para `ListFilters`.
- Preservar busca inline por usuário ou entidade e filtros estruturados por ação, tipo e ator.
- Exibir chips para filtros ativos e ação clara de limpeza, alinhando a experiência com o restante das listas administrativas.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-log-management`: filtros da lista de auditoria passam a usar o padrão compartilhado `ListFilters` com responsividade, resumo de filtros ativos e limpeza consistente.

## Impact

- Código afetado em `src/features/audit-logs/components/filter`, `src/features/audit-logs/hooks/use-filter` e testes relacionados.
- Nenhuma mudança de API, persistência, autorização ou dependência externa.
