## Context

O slice de remunerações possui variação por perfil: administradores podem filtrar também por colaborador, enquanto usuários comuns não. A migração para `ListFilters` precisa preservar essa diferença sem alterar o contrato de busca.

## Goals / Non-Goals

**Goals:**

- Adotar `ListFilters` em `remunerations`.
- Preservar filtros condicionais por papel.
- Tornar filtros não default visíveis e removíveis por chip.

**Non-Goals:**

- Alterar escopo por role, params, queries ou comportamento de export.
- Reestruturar a tela além da superfície de filtros.

## Decisions

- Manter `query` inline e usar superfície avançada compartilhada para filtros estruturados.
  Rationale: segue padrão das listas equivalentes.

- Preservar renderização condicional de `employeeId` para admins no novo layout.
  Rationale: essa diferença é regra de produto, não detalhe visual.

- Reusar hook existente com extensão mínima para suportar chips.
  Rationale: reduz risco em tela com lógica de role-aware filtering.

## Risks / Trade-offs

- [Divergência entre admin e non-admin no resumo de chips] → chips devem refletir apenas campos realmente visíveis/aplicáveis ao ator.
- [Nested popover com autocompletes] → avaliar posicionamento inline para campos com overlay próprio quando necessário.
