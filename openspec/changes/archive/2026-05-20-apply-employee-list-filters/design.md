## Context

`employees` já possui busca URL-driven, filtros avançados e limpeza de estado, mas ainda depende de `FilterPopover`. O objetivo é convergir a camada de apresentação com `clients` e `contracts`, preservando o contrato de busca existente.

## Goals / Non-Goals

**Goals:**

- Adotar `ListFilters` no slice de colaboradores.
- Manter semântica dos filtros atuais e URL state.
- Ganhar drawer mobile e chips de filtros ativos.

**Non-Goals:**

- Alterar schema de busca, nomes de params, queries Prisma ou regras de permissão.
- Introduzir nova abstração além de `ListFilters`.

## Decisions

- Reusar `ListFilters` como composição principal.
  Rationale: reduz drift com slices de referência e evita manter dois padrões equivalentes.

- Preservar busca inline e manter filtros estruturados em superfície avançada.
  Rationale: segue contrato já existente de employees e não muda ergonomia principal da tela.

- Expor apply explícito no hook se necessário para remover chips individuais.
  Rationale: mantém orquestração no hook, não no componente.

## Risks / Trade-offs

- [Regressão de labels/estado entre desktop e mobile] → Reusar mesmo conjunto de campos para drawer e popovers.
- [Mudança visual sem mudança funcional] → Cobrir reset/apply do hook com teste focado e validar labels com referência de `clients`.
