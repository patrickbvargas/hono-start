## Context

Dashboard já entrega tabela mensal de remunerações por colaborador, com buckets mensais e total no período por linha. O componente atual em [src/features/dashboard/components/remuneration-table/index.tsx](/C:/Dev/hono-start/src/features/dashboard/components/remuneration-table/index.tsx) renderiza cabeçalho dinâmico por mês e coluna fixa de total, mas não mostra consolidação vertical por mês. A mudança cruza read model, agregação do dashboard e renderização da tabela, porém permanece dentro do capability `dashboard` e não exige novo endpoint, dependência externa ou mudança de permissão.

## Goals / Non-Goals

**Goals:**

- Expor subtotal por mês para o conjunto de colaboradores visível na tabela do dashboard.
- Preservar filtros, escopo por sessão, buckets mensais e total por colaborador já existentes.
- Usar padrão visual compatível com shared UI e tabela atual, preferindo linha-resumo no próprio grid.

**Non-Goals:**

- Alterar regras de cálculo de remuneração ou critérios de inclusão de registros.
- Adicionar novos filtros, ordenação ou gráficos derivados do subtotal.
- Mudar comportamento de outras tabelas fora da superfície de remunerações do dashboard.

## Decisions

- Calcular subtotais mensais na agregação do read model do dashboard.
  Rationale: subtotal depende exatamente do mesmo conjunto filtrado e autorizado que já alimenta linhas e total por colaborador. Centralizar no read model evita recomputação duplicada na UI e facilita testes de contrato em `queries.test.ts`.
  Alternative considered: somar valores no componente React a partir de `rows`. Rejeitado porque desloca regra derivada para apresentação e enfraquece contrato do summary payload.

- Estender schema do dashboard com estrutura explícita para subtotal mensal e total geral do subtotal.
  Rationale: payload tipado deixa claro que a tabela tem dados de corpo e de rodapé distintos, sem sobrecarregar `remunerationTable` com linha sintética de colaborador.
  Alternative considered: inserir uma linha fake como último item de `remunerationTable`. Rejeitado porque mistura semântica de colaborador com agregado e complica ordenação, empty state e testes.

- Renderizar subtotal como rodapé visual da tabela de remunerações.
  Rationale: subtotal por coluna representa resumo do conjunto exibido, não mais um colaborador. Rodapé comunica melhor esse papel e se alinha ao primitive `TableFooter` já exposto pela shared UI.
  Alternative considered: renderizar card separado abaixo da tabela. Rejeitado porque quebra leitura coluna-a-coluna e reduz comparabilidade com os buckets mensais.

## Risks / Trade-offs

- [Divergência entre soma de linhas e subtotal exibido] → Mitigation: testes focados no builder do summary garantem que subtotal mensal e total geral derivam dos mesmos buckets usados na tabela.
- [DataTable atual não injeta `tfoot` por padrão] → Mitigation: manter mudança local na superfície de dashboard, usando composição com shared table primitives ou extensão mínima e reutilizável do `DataTable` sem quebrar listas server-driven existentes.
- [Usuário sem registros pode ver resumo confuso] → Mitigation: preservar empty state atual e ocultar subtotal quando não houver linhas visíveis.
