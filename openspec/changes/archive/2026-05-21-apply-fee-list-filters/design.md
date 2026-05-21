## Context

O slice de honorários já expõe busca URL-driven e filtros compostos por contrato, receita, período e estado. Hoje essa UI ainda depende de `FilterPopover`, sem o padrão compartilhado de chips ativos e drawer mobile.

## Goals / Non-Goals

**Goals:**

- Adotar `ListFilters` em `fees`.
- Preservar contrato de busca e semântica de filtros.
- Tornar ativos os filtros visíveis e removíveis por chip.

**Non-Goals:**

- Alterar campos, params, queries Prisma ou regras de autorização.
- Reprojetar a lógica de opções dependentes de contrato/receita.

## Decisions

- Manter busca por processo inline e filtros estruturados em superfície avançada compartilhada.
  Rationale: alinha com listas equivalentes sem mudar semântica de busca principal.

- Tratar `Autocomplete` de contrato/receita com cuidado para evitar popover dentro de popover.
  Rationale: campos com overlay próprio podem precisar ficar inline no desktop ou somente no drawer mobile, conforme a implementação final.

- Reusar hook de filtro existente e estendê-lo apenas se necessário para chips removíveis.
  Rationale: preserva boundary atual.

## Risks / Trade-offs

- [Nested popover com autocompletes] → avaliar layout inline para campos com overlay próprio.
- [Complexidade visual com muitos filtros] → agrupar em `ListFilters` e mostrar só filtros não default como chips.
