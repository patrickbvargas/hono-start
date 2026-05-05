## Context

O dashboard atual ja possui uma query agregadora unica (`getDashboardSummary`) e uma composicao de UI que combina cards, graficos e um card de atividade recente. O pedido nao altera a estrutura geral da tela: todos os cards e graficos atuais permanecem, e apenas o bloco de atividade recente sai para dar lugar a uma tabela operacional.

A nova necessidade e diferente dos graficos existentes. Ela exige leitura numerica exata por colaborador e por mes, dentro do periodo filtrado no dashboard, para comparacao e apoio ao pagamento. Essa leitura perde utilidade se ficar apenas em grafico, porque o usuario precisa bater valores exatos e enxergar mes a mes lado a lado.

Stakeholders principais:
- administradores, que precisam ver remuneracoes mensais por colaborador na firma;
- usuarios regulares, que precisam ver apenas seus proprios valores mensais dentro do escopo permitido;
- mantenedores, que precisam preservar o padrao de dashboard, o boundary de feature e o uso do `DataTable` compartilhado.

## Goals / Non-Goals

**Goals:**
- substituir o bloco de atividade recente por uma tabela mensal de remuneracao por colaborador;
- consolidar dados por colaborador e por mes calendario dentro do periodo filtrado;
- reutilizar filtros e regras de escopo ja aplicados no dashboard;
- usar `DataTable` para manter padrao estrutural do repositorio;
- garantir que cards, graficos e tabelas do dashboard usem `Card` compartilhado como wrapper visual canonico.

**Non-Goals:**
- nao alterar os demais cards e graficos do dashboard;
- nao adicionar novo grafico para esta necessidade na primeira entrega;
- nao transformar a rota de remuneracoes em pivot table;
- nao alterar regras de negocio de remuneracao, fee, contrato ou permissao.

## Decisions

### 1. Reuse the dashboard summary query instead of creating a second dashboard endpoint

A tabela mensal de remuneracao sera alimentada pelo mesmo resumo do dashboard, estendendo o payload atual com uma colecao agregada por colaborador e por mes.

Rationale:
- evita nova ida ao servidor para a mesma combinacao de filtros;
- mantem loader, hook e rota finos;
- garante que cards, graficos e tabela compartilhem a mesma leitura de periodo e de escopo.

Alternatives considered:
- criar query separada para a tabela: simplifica payload localmente, mas duplica validacao, scoping e prefetch;
- montar agregacao no client: mistura regra de negocio com apresentacao e piora consistencia.

### 2. Table rows are collaborators and table columns are calendar months inside the selected period

Cada linha representa um colaborador. Cada coluna mensal representa um bucket `YYYY-MM` convertido para rotulo pt-BR como `Jan/2026`. A tabela tambem inclui uma coluna final de total no periodo.

Rationale:
- reflete exatamente a pergunta operacional: quanto cada colaborador recebeu em cada mes;
- facilita comparacao horizontal entre meses;
- mantem leitura numerica exata, diferente de um grafico de barras agrupadas com muitas series.

Alternatives considered:
- uma linha por remuneracao: ja existe na rota de remuneracoes e nao resolve consolidacao;
- uma coluna por colaborador e linha por mes: piora escalabilidade quando existem muitos colaboradores;
- heatmap puro: leitura comparativa boa, mas ruim para conferencia numerica sem o valor textual.

### 3. The table requires an explicit monthly window and should degrade predictably when no period is set

Quando `dateFrom` e `dateTo` existirem, a tabela cobre todos os meses entre eles, inclusive meses zerados. Sem periodo explicito, a implementacao deve usar a mesma janela mensal curta ja adotada pelo dashboard para evitar largura imprevisivel.

Rationale:
- evita tabela com numero arbitrario de colunas;
- mantem coerencia com o restante da tela;
- meses zerados ajudam comparacao e nao escondem ausencia de pagamentos.

Alternatives considered:
- mostrar apenas meses com movimento: dificulta comparar lacunas;
- exigir periodo obrigatorio: mudaria a UX atual do dashboard sem necessidade.

### 4. The recent activity card is removed rather than relocated

O bloco de "Atividade recente" sai do dashboard e nao e movido para outra posicao nesta mudanca.

Rationale:
- pedido explicito do usuario;
- evita aumentar altura e densidade da pagina;
- libera area suficiente para uma tabela com scroll horizontal.

Alternatives considered:
- manter atividade recente abaixo da tabela: aumentaria ruído visual;
- mover atividade recente para drawer ou aba: fora do escopo.

### 5. DataTable is the correct first delivery, with optional visual enhancement later

A primeira entrega usa `DataTable` padrao. Melhorias visuais como destaque por intensidade de valor podem ser consideradas depois, sem mudar o contrato principal.

Rationale:
- reduz risco de UI inventada;
- atende diretamente a necessidade operacional;
- segue componente compartilhado ja usado no projeto.

Alternatives considered:
- grafico de barras agrupadas por colaborador: ruim quando ha muitos colaboradores e quando o usuario precisa do valor exato;
- matriz custom sem `DataTable`: foge do padrao do repositorio sem necessidade.

### 6. Dashboard analytical surfaces must keep `Card` as the outer visual container

Todos os blocos analiticos do dashboard, incluindo cards metricos, graficos e a nova tabela, devem usar o componente compartilhado `Card` como wrapper externo.

Rationale:
- mantem consistencia visual entre superficies do dashboard;
- segue o padrao ja presente nos componentes atuais de cards e charts;
- evita que a nova tabela pareca um bloco solto ou um segundo sistema visual.

Alternatives considered:
- renderizar tabela sem `Card`: quebra consistencia;
- criar wrapper visual novo so para analytics: adiciona padrao desnecessario.

## Risks / Trade-offs

- [Periodo longo demais gera muitas colunas] -> limitar comportamento padrao a janela mensal curta quando nao houver periodo explicito e usar scroll horizontal.
- [Muitos colaboradores podem tornar a tabela alta] -> aceitar altura rolavel como trade-off inicial e manter ordenacao previsivel.
- [Agregacao mensal pode divergir da rota de remuneracoes se filtros nao forem aplicados igual] -> derivar o where de remuneracao com a mesma regra de escopo ja usada no dashboard.
- [Usuarios podem querer drill-down por celula] -> manter fora do escopo inicial; possivel evolucao futura.
