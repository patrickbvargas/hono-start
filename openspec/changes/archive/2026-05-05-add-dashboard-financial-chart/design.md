## Context

O dashboard atual ja usa uma slice propria com busca validada por URL, prefetch na rota, query server-side e composicao por shared UI. Hoje ele entrega cards, comparativos, breakdowns e atividade recente, mas nao expoe uma serie temporal mensal nem filtros por area contratual e tipo de receita. O pedido tambem introduz uma nova dependencia visual, porque o projeto ainda nao expoe `chart.tsx` na camada `@/shared/components/ui`.

Stakeholders principais:
- administradores, que precisam de leitura firm-wide com filtros operacionais;
- usuarios regulares, que precisam acompanhar apenas receitas e remuneracoes dentro do proprio escopo;
- mantenedores do repositorio, que precisam preservar fronteira shared UI e search state canonicamente na URL.

## Goals / Non-Goals

**Goals:**
- adicionar um grafico de colunas com serie mensal de receita e remuneracao dentro do periodo filtrado;
- expandir filtros do dashboard para `legalArea` e `revenueType` sem sair do padrao URL-driven;
- preservar isolamento por firma e restricoes de role no mesmo resumo e no novo grafico;
- introduzir suporte a chart via shared UI, com composicao baseada em Recharts v3 e `ChartContainer`.

**Non-Goals:**
- nao criar nova rota analitica, exportacao, drill-down ou estado de overlay;
- nao alterar formulas de remuneracao ou regras de fee/revenue;
- nao substituir os cards, comparativos e breakdowns existentes.

## Decisions

### 1. Reuse current dashboard summary query instead of adding a second analytics endpoint

Vamos estender `getDashboardSummary` para devolver uma nova colecao `financialEvolution` junto do payload ja usado pela tela.

Rationale:
- evita segunda ida ao servidor para mesma combinacao de filtros;
- mantem loader, hook e suspense boundary simples;
- garante que cards, breakdowns e chart compartilhem mesma interpretacao de escopo e periodo.

Alternatives considered:
- criar query separada so para chart: reduz payload individual, mas duplica parse de filtro, regras de escopo e prefetch;
- montar serie no client a partir de dados brutos: piora payload, mistura regra de negocio com UI e aumenta risco de divergencia.

### 2. Monthly series will be keyed by calendar month (`YYYY-MM`) and rendered for the inclusive filtered range

O backend vai montar baldes mensais por ano/mes. Quando houver `dateFrom` e `dateTo`, a serie cobre todos os meses entre eles, inclusive meses zerados. Sem periodo explicito, a serie cobre janela recente deterministica do proprio dashboard para manter leitura util.

Rationale:
- usuario pediu acompanhamento por ano e mes;
- meses zerados evitam grafico "quebrado" e mostram lacunas de faturamento;
- chave estavel facilita teste e formatacao pt-BR no frontend.

Alternatives considered:
- agrupar por dia: ruido alto para dashboard executivo;
- agrupar apenas meses com movimento: esconde intervalos sem receita/remuneracao;
- agrupar no frontend: repetiria regra de calendario e limites.

### 3. Revenue series will continue to reflect received money semantics, not planned revenue

A barra de receita no grafico vai usar a mesma semantica de "receita recebida" ja usada no dashboard: soma de honorarios (`fee.amount`) e entrada inicial (`downPaymentValue`) quando a data inicial de pagamento cair no mes filtrado.

Rationale:
- alinha grafico com o card e com os breakdowns atuais;
- evita misturar previsto com realizado no mesmo eixo;
- segue regra de negocio ja vigente para `paidValue`.

Alternatives considered:
- usar `totalValue` planejado: mais facil, mas distorce evolucao real de caixa;
- exibir previsto e recebido no mesmo chart: util, porem fora do escopo pedido.

### 4. Dashboard filter options will reuse contract lookup queries instead of creating duplicate lookup sources

Legal areas e revenue types viram options do dashboard consumindo os mesmos query factories do slice de contratos.

Rationale:
- lookup ja existe e respeita boundary do repo;
- evita duplicar leitura de tabela global;
- mantem rotulos/values consistentes entre contrato e dashboard.

Alternatives considered:
- criar server fns duplicadas no dashboard: mais acoplamento e manutencao;
- hardcode de lookup values: quebra contrato de lookup central.

### 5. Chart implementation will live in shared UI and be consumed compositionally from the dashboard feature

Vamos adicionar `src/shared/components/ui/chart.tsx` e exportar seu public surface via `src/shared/components/ui/index.ts`. O dashboard importa apenas shared UI e componentes `recharts`.

Rationale:
- atende regra de vendor boundary do projeto;
- segue docs atuais do shadcn chart, que usam composicao com Recharts em vez de wrapper fechado;
- deixa outros features reutilizarem tooltip/legend/config futuramente.

Alternatives considered:
- importar chart helper direto de vendor no dashboard: viola contrato;
- renderizar Recharts puro sem shared chart helpers: perde consistencia visual e foge do pedido do usuario.

## Risks / Trade-offs

- [Serie mensal sem periodo explicito pode surpreender expectativa] → usar janela recente curta e copy clara no card do grafico.
- [Filtros novos podem gerar combinacoes sem dados] → manter meses zerados e empty-state pt-BR quando toda serie ficar vazia.
- [Nova dependencia aumenta superficie de build] → adicionar `recharts` explicitamente e validar com testes alvo/build.
- [Lookup compartilhado entre slices cria acoplamento route-facing] → consumir somente query factories publicas do barrel/API de contratos, sem acessar arquivos internos arbitrarios.
