## Context

`clients` é slice de referência para listas com filtros. `contracts` já possui contrato de busca URL-driven, opções prefetched no loader e hook dedicado de filtro, mas ainda renderiza interface antiga via `FilterPopover`. Mudança é local de frontend e deve preservar schemas, search params e queries existentes.

## Goals / Non-Goals

**Goals:**

- Reusar `ListFilters` em `contracts` sem alterar semântica de filtros.
- Igualar desktop/mobile ao padrão de `clients`.
- Tornar filtros ativos explícitos com chips removíveis e limpeza global.
- Preservar integração atual com `useContractFilter` e loader de opções.

**Non-Goals:**

- Alterar contrato de busca, nomes de params, queries Prisma ou regras de autorização.
- Extrair nova abstração global além de `ListFilters`.
- Redesenhar layout da rota de contratos fora da área de filtros.

## Decisions

- Usar `ListFilters` como composição principal.
  Rationale: já é componente compartilhado do projeto para listas equivalentes; reduz drift frente ao slice de referência.
  Alternative considered: manter `FilterPopover` com ajustes visuais. Rejeitado porque preserva padrão divergente e não cobre drawer mobile/chips.

- Estender `useContractFilter` com `filter`, `defaultFilter` e `handleApplyFilter`.
  Rationale: chips removíveis precisam aplicar valores explícitos, mesmo padrão já usado em `useClientFilter`.
  Alternative considered: mutar form diretamente dentro do componente. Rejeitado para não empurrar orquestração para camada de apresentação.

- Manter `clientId` como filtro singular com `Autocomplete`.
  Rationale: segue contrato atual de busca e evita alterar comportamento de query.
  Alternative considered: trocar para seleção múltipla. Rejeitado por mudar requisito funcional.

## Risks / Trade-offs

- [Paridade visual entre desktop e mobile] → Reusar exatamente `ListFilters.Popover` e `ListFilters.Drawer` com mesmos campos.
- [Chips exibirem labels incorretos para lookup/entity options] → Mapear labels a partir de hooks de opções já carregados pela rota.
- [Regressão no reset de filtros] → Cobrir `useContractFilter` com testes focados em aplicar e limpar filtros.
