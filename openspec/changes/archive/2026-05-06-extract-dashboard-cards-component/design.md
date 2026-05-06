## Context

O dashboard já usa componentes dedicados para gráfico de evolução, tabela de remunerações e gráficos de breakdown. Os cards de métricas seguem embutidos em `components/dashboard/index.tsx`, junto com helpers visuais e lógica de mapeamento. Isso cria uma exceção local dentro da própria feature e enfraquece o papel do componente raiz como orquestrador de layout.

## Goals / Non-Goals

**Goals:**

- Extrair os cards de métricas para um componente próprio da feature dashboard.
- Preservar a renderização atual dos cards, incluindo ícones, formatação de variação e tooltip de período anterior.
- Deixar `Dashboard` responsável por scroll e composição das superfícies analíticas de alto nível.

**Non-Goals:**

- Alterar conteúdo, ordem, copy, estilos de negócio ou regras de cálculo das métricas.
- Mudar queries, schemas, filtros, permissões ou modelos de dados do dashboard.
- Introduzir novo padrão de export público para a feature.

## Decisions

- Criar `src/features/dashboard/components/metric-cards/index.tsx` como implementação concreta do bloco de métricas.
  Rationale: segue padrão já usado pela feature para `financial-evolution`, `remuneration-table` e `breakdown-chart`, sem criar barrel adicional fora do shape já existente.

- Manter helpers visuais e constantes de ícones dentro do novo componente.
  Rationale: essa lógica pertence ao rendering dos cards, não ao layout do dashboard. Assim o componente pai deixa de conhecer detalhes de apresentação.

- Fazer `Dashboard` importar e compor `DashboardMetricCards`.
  Rationale: preserva `Dashboard` como ponto de montagem da página, consistente com orientação de composição do React para separar blocos reutilizáveis em arquivos próprios.

- Atualizar o teste focado de `Dashboard` para mockar cards, gráfico e tabela como superfícies independentes.
  Rationale: o teste passa a validar orquestração do componente pai em vez de detalhes internos de cada superfície.

## Risks / Trade-offs

- [Cobertura dos helpers dos cards diminuir] → Mitigation: manter a implementação do componente extraído simples e adicionar asserção de renderização do bloco no teste do dashboard.
- [Refactor introduzir drift de import boundary] → Mitigation: manter imports de UI via `@/shared/components/ui` e componente novo dentro da própria feature.
- [Mudança parecer maior que valor entregue] → Mitigation: limitar refactor à extração estrutural, sem alterar comportamento ou API pública da feature.
