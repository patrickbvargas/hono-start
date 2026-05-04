## Context

O dashboard ja recebe `legalAreaRevenue` e `revenueTypeRevenue` no payload de `getDashboardSummary`, com `label`, `value`, `total`, `formattedTotal` e `percentage`. Hoje esses dados sao renderizados por um componente local de breakdown que usa barras de progresso estaticas, enquanto a evolucao financeira ja usa a infraestrutura compartilhada de chart em `@/shared/components/ui`.

Stakeholders:
- administradores, que precisam comparar rapidamente quais areas juridicas mais geram receita;
- usuarios regulares, que precisam manter a mesma visao filtrada sem ganhar acesso novo;
- mantenedores, que precisam preservar boundary shared UI e consistencia visual do dashboard.

## Goals / Non-Goals

**Goals:**
- substituir `Receita por área` por um chart horizontal que priorize comparacao de ranking;
- substituir `Receita por tipo` por um donut chart que priorize leitura de participacao;
- reutilizar os dados e o tooltip shared chart existentes, sem alterar query, filtros ou regras de escopo.

**Non-Goals:**
- nao alterar `getDashboardSummary`, schemas ou rota do dashboard;
- nao criar nova fonte de dados, novo endpoint, ou nova dependencia de vendor fora do boundary compartilhado;
- nao mexer no chart de evolucao financeira nem nos cards de metricas.

## Decisions

### 1. Keep breakdown data contract unchanged

Os charts vao consumir `dashboardBreakdownItemSchema` exatamente como ele ja existe.

Rationale:
- evita churn em data layer e testes de agregacao;
- mantem as mesmas semanticas de total e percentual entre lista antiga e chart novo;
- reduz risco de regressao em escopo por role e filtros.

Alternatives considered:
- recalcular dataset visual no backend: sem ganho funcional e com mais impacto;
- criar shape separado para chart: duplicaria contrato para mesma informacao.

### 2. Use horizontal bar chart for legal-area revenue

`Receita por área` vira `BarChart` com layout horizontal.

Rationale:
- nomes de areas tendem ser longos, entao eixo vertical comporta labels melhor;
- comparacao de magnitude entre areas fica mais direta que em pie/donut;
- combina com leitura de ranking que o bloco ja implicava.

Alternatives considered:
- manter progress bars: menos comparativo e menor densidade visual;
- usar donut/pie: pior para labels longos e ranking fino.

### 3. Use donut chart for revenue-type revenue

`Receita por tipo` vira `PieChart` com `innerRadius`, legenda e tooltip.

Rationale:
- tipos de receita costumam ser poucos e encaixam bem em share-of-total;
- percentual ja existe no payload e pode aparecer no tooltip e legenda;
- visual complementa o chart de barras sem repetir mesmo padrao duas vezes.

Alternatives considered:
- outro bar chart: funcional, mas menos complementar e mais repetitivo;
- tabela simples: menos leitura visual de participacao.

### 4. Extract a dedicated dashboard breakdown chart component

Vamos criar componente local proprio para os dois cards de breakdown em vez de inflar `components/index.tsx`.

Rationale:
- mantem `Dashboard` focado em composicao;
- facilita empty states e configuracoes diferentes por tipo de chart;
- segue padrao de feature-local UI no slice.

Alternatives considered:
- embutir tudo em `index.tsx`: mais rapido, mas pior manutencao;
- criar componente shared: prematuro, pois sem outro consumidor atual.

## Risks / Trade-offs

- [Donut pode perder legibilidade com muitas categorias] → manter legenda, tooltip e fallback textual no card.
- [Labels longos no chart horizontal podem truncar] → usar largura dedicada, tooltip e espaco vertical por linha.
- [Dois charts diferentes aumentam variacao visual] → reaproveitar `Card`, `ChartContainer`, `ChartTooltip` e paleta do sistema para coesao.
