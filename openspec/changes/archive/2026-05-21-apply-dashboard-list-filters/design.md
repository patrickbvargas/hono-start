## Context

O dashboard já possui uma composição própria: filtro inline opcional de colaborador para admins, atalhos inline de período e `FilterPopover` para período manual, área e tipo de receita. A migração para `ListFilters` precisa preservar esse shape porque os atalhos de período são parte central da UX atual.

## Goals / Non-Goals

**Goals:**

- Adotar `ListFilters` apenas para a superfície avançada de filtros do dashboard.
- Preservar atalhos de período inline e seu comportamento atual.
- Preservar filtro inline de colaborador para administradores.
- Tornar filtros avançados não default mais explícitos visualmente.

**Non-Goals:**

- Alterar os atalhos `6 meses`, `12 meses` e `2026`.
- Mover os atalhos de período para drawer/popover genérico.
- Alterar semântica de `dateFrom`, `dateTo`, `employeeId`, `legalArea` ou `revenueType`.

## Decisions

- Manter os atalhos de período fora da superfície avançada compartilhada.
  Rationale: eles são controles primários do dashboard e já têm comportamento canônico documentado.

- Usar `ListFilters` apenas para os filtros manuais/avançados.
  Rationale: convergência visual sem destruir a ergonomia específica do dashboard.

- Preservar o filtro inline de colaborador para administradores.
  Rationale: essa visibilidade inline já faz parte do contrato atual do dashboard.

## Risks / Trade-offs

- [Perder semântica dos atalhos ao forçar padrão de lista] → manter atalhos exatamente onde estão hoje, fora da superfície avançada.
- [Misturar controles inline e avançados de forma confusa] → deixar claro que `ListFilters` cobre somente período manual e filtros secundários.
