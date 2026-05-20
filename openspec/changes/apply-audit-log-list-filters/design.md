## Context

`audit-logs` é lista administrativa com busca livre e filtros categóricos. A migração é puramente de superfície de filtros e precisa preservar URL state, sem alterar escopo administrativo nem consulta determinística.

## Goals / Non-Goals

**Goals:**

- Adotar `ListFilters` no slice de auditoria.
- Preservar busca, filtros e ordenação existentes.
- Tornar filtros ativos explícitos via chips removíveis.

**Non-Goals:**

- Alterar consultas, paginação, escopo administrativo ou semântica dos filtros.
- Reprojetar tabela/lista da auditoria.

## Decisions

- Manter busca inline e filtros categóricos em superfície avançada compartilhada.
  Rationale: segue padrão novo sem mexer no contrato.

- Mapear filtros selecionados para chips por label.
  Rationale: auditoria usa filtros multi-seleção e o resumo visual depende de labels legíveis.

- Reusar hook existente com extensão mínima para suportar remoção individual.
  Rationale: reduz risco de regressão na URL orchestration.

## Risks / Trade-offs

- [Volume alto de chips para filtros multi-seleção] → mostrar apenas filtros não default e manter ação clara de limpeza global.
- [Drift com contract/client patterns] → alinhar labels e estrutura ao padrão compartilhado.
