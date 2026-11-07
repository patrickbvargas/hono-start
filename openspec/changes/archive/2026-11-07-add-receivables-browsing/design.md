## Context

O checkout já contém `Receivable`, `Receipt`, `ReceiptReversal` e a ponte `ContractRevenueReceivable`. `features/financial-titles` possui geração e opções de geração, mas não coleção de consulta. `/honorarios` continua sendo uma feature legada distinta. A mudança ativa de desacoplamento ainda tem tarefas de seed pendentes; não é necessário concluí-las ou alterar dados para implementar esta consulta.

Referências obrigatórias: `docs/domain/{DOMAIN_MODEL,FINANCIAL_SYSTEM,BUSINESS_RULES,ROLES_AND_PERMISSIONS,MULTITENANCY}.md` e `docs/implementation/{ARCHITECTURE,CONVENTIONS,DATA_ACCESS,SECURITY,FRONTEND_LAYOUT,FRONTEND_TABLES,QUALITY_WORKFLOW}.md`. `docs/index.md` é citado pelo workflow, mas não existe neste checkout.

Referências concretas de composição: `src/routes/_app/despesas.tsx`, `features/expenses/components/{table,list,filter,details,workspace}`, `features/clients`, `EntityView`, `EntityActions`, `EntityDetail`, `EntityWorkspace`, `RelatedRecordLink` e os testes de context-menu de related-records.

## Goals / Non-Goals

**Goals:** entregar a experiência completa de consulta já conhecida: coleção responsiva, filtros, totais, menus equivalentes, resumo contextual e página dedicada com abas, preservando autorização e precisão financeira.

**Non-Goals:** os definidos em proposal.md. Paridade de interação não introduz CRUD genérico em obrigações financeiras. Nenhuma tela conterá botões de escrita sem comportamento implementado.

## Decisions

### 1. Ownership e fronteiras

Criar `features/receivables` com `api/queries.ts`, `data/queries.ts`, `schemas/{model,filter,search,sort,workspace}.ts`, `constants`, `hooks/{use-data,use-filter,use-workspace}.ts`, `utils` e componentes de filter/table/list/details/workspace. Criar apenas responsabilidades necessárias à consulta; sem mutations ou hooks de formulário vazios. Barrel público mínimo, sem imports entre internals de features.

A geração permanece em financial-titles. Reutilizar helpers monetários/data existentes quando compatíveis; não importar internals de contracts nem reutilizar a API de Fee. Não criar abstração parametrizada por receber/pagar antes de existir necessidade real de reuso. A responsabilidade de escopo fica em shared/session; tradução para Prisma e cálculos de leitura ficam na feature.

### 2. Rotas e contexto

`/_app/contas-a-receber` usa search validado, strip de defaults, loader com prefetch da coleção e opções incondicionais. `detailId` seleciona resumo via `useEntityOverlay`, fica fora de loaderDeps e query keys da coleção. Fechar resumo limpa só `detailId`, com replace.

`/_app/contas-a-receber_.$receivableId` valida ID inteiro positivo, faz prefetch do título autorizado e compõe `ReceivableWorkspace`. Search contém `tab` e `returnTo` validado pelo search da coleção, como as páginas atuais. A ação principal abre página; menus oferecem Abrir página e Resumo usando o vocabulário dos componentes existentes. Context menu desktop e dropdown compartilham a mesma composição, inclusive acesso pelo teclado; mobile acessa as mesmas ações pelo dropdown. RelatedRecordLink recebe o tipo receivable para consulta contextual, sem eager loading e sem ciclo estático.

Registrar Contas a receber na navegação existente com grants `org:receivables:read_all` OU `org:receivables:read_assigned`. Preservar `/honorarios`; não mudar agrupamentos nem redesenhar sidebar. Guardas precoces não substituem proteção nas server functions.

### 3. Coleção e filtros

Compor Wrapper/Header/Body, EntityView, DataTable + columns.tsx, DataCardList, Pagination, ListFilters, atalhos de período e ListEmptyState. Mesmas dimensões, tipografia, espaçamentos, ScrollArea, menus e componentes UI das referências. Alternância tabela/cards no desktop e cards no mobile seguem preferência e breakpoint já existentes.

Filtros URL: busca por devedor/observação/processo; devedor; contrato; origem (todas/contrato/sem vínculo); classificação; estado financeiro; intervalo inclusivo de vencimento; analítica; meio previsto. IDs de entidades são IDs persistidos; lookups usam value. Defaults: busca/filtros vazios, todas as origens/estados, sem intervalo implícito, paginação e tamanho canônicos. Ordenação inicial vencimento ascendente + id ascendente. Permitir ordenação por devedor, vencimento e valor nominal; não anunciar ordenação de campos derivados sem suporte servidor.

Tabela: identificação, devedor, origem/contrato, classificação, vencimento, situação, principal abatido, saldo, valor nominal e ações. Valor nominal é a última coluna de dados. Cards exibem devedor, vencimento, situação e saldo com demais informações na composição já usada nas listas. Não inventar número de parcela que o modelo não persiste.

Cabeçalho apresenta resumo filtrado compacto: valor nominal ativo, principal abatido válido, saldo aberto, saldo vencido e cancelado nominal separado. Totais cobrem todo o resultado, não a página. Cada métrica tem rótulo explícito e permanece sem quebra interna; layout pode distribuir métricas em linhas no mobile. Cancelados nunca inflam saldo aberto/vencido. Mesma seleção autorizada e mesmos filtros alimentam rows, count e agregados.

### 4. Cálculos e estados

Definir um read model validado por Zod. Usar Decimal ou centavos exatos até a serialização no padrão monetário existente. Não agregar principal após conversão para number nem deduzir caixa efetivo do nominal.

- Principal abatido válido = soma de principalAbated dos receipts sem reversal.
- Saldo principal = amount menos principal abatido válido; para título cancelado, saldo exigível e contribuição aos totais abertos são zero, mantendo nominal e informação de cancelamento.
- Caixa recebido válido = soma de effectiveAmount dos receipts sem reversal, separado do principal.
- Situação visual exclusiva: Cancelado; Quitado (saldo zero); Em atraso (saldo positivo, dueDate anterior a hoje); Parcial (0 < principal < amount, não vencido); Pendente (nenhum abatimento, não vencido).
- Manter também indicador de abatimento parcial independente. Título parcialmente recebido e vencido aparece Em atraso e informa principal/saldo parcial; filtro Parcial encontra ambos os casos. Filtro Em atraso encontra todo saldo vencido. A sobreposição de filtros é intencional e será registrada em DOMAIN_MODEL/USER_FLOWS.
- Hoje usa data civil de America/Sao_Paulo, como o status financeiro atual, sem deslocar dueDate (`@db.Date`) por conversão de timezone. Vence hoje não é atraso. Renovar consulta no próximo dia civil enquanto tela estiver aberta e ao recuperar foco para não manter badge obsoleto.

Reads da coleção devem aplicar estado derivado e ordenação ANTES da paginação, sem filtrar a página no cliente. Usar recursos Prisma e consultas parametrizadas existentes se agregação relacional exigir SQL; não carregar toda a carteira no navegador. Rows/count/totais devem compartilhar filtros e snapshot de leitura coerente. Não adicionar índices ou migrations especulativas.

### 5. Resumo e página dedicada com abas

Reutilizar conteúdo entre EntityDetail e EntityWorkspace, mantendo seus shells existentes:

O drawer segue a composição de ExpenseDetails/PersonDetails: cabeçalho compacto, link Abrir página no cabeçalho desktop e início do corpo mobile, campos principais diretos, separadores e seções simples. Não renderizar no resumo a lista de seções da página com abas: ela contém cards próprios do workspace. ReceivableOverview compartilha os campos, mantendo a apresentação overview em card exclusivamente na página dedicada e a apresentação all plana no drawer. Anexos do resumo são compactos; timestamps usam Registro e auditoria usa Histórico sem EntityWorkspaceHistory no drawer.

| Aba/seção | Conteúdo |
|---|---|
| Visão geral | ID, devedor, origem/contrato/receita via ponte ou Sem vínculo com contrato, classificação, vencimento, analítica, meio previsto, observações, valores, situação e cancelamento |
| Recebimentos | Leitura de receipts persistidos: data efetiva, principal, desconto, juros, multa, caixa efetivo, meio real e estado; reversal mostra data/motivo e preserva evento original |
| Anexos | Consulta dos anexos do título pelo componente público existente, com abrir/preview/download autorizados e sem habilitar upload/delete nesta entrega |
| Histórico | createdAt/updatedAt e EntityAuditHistory autorizado do Receivable, sem carregar payloads operacionais ou remunerações alheias |

Recebimentos exige `org:receipts:read_all` ou `org:receipts:read_assigned` e acesso ao título; Anexos exige `org:attachments:read`; auditoria exige `org:audit_logs:read` mais acesso ao dono. Sem grant, aba restrita não aparece nem dispara requests; URL para aba indisponível volta a Visão geral. Os agregados intrínsecos ao título continuam visíveis com grant de receivable, sem retornar eventos de baixa não autorizados. Histórico mantém timestamps básicos mesmo sem grant de auditoria.

Devedor/contrato usam RelatedRecordLink apenas quando recurso relacionado é acessível; caso contrário, rótulo simples. Ausência ou exclusão operacional da origem não apaga a obrigação nem impede leitura financeira autorizada. Não consultar remunerações nem gráficos globais para compor detalhes.

### 6. Autorização uniforme

Derivar firmId e actor da sessão verificada. Com read_all, limitar à filial; com read_assigned, atravessar ContractRevenueReceivable → Contract → atribuições do ator. Títulos sem ponte ficam fora do escopo assigned. Reutilizar política corrente de atribuições e ciclo de vida, sem exigir que o contrato esteja operacionalmente editável.

Aplicar escopo no banco antes de busca, options, contagens e totais. Opções de devedores/contratos derivam de títulos visíveis, incluindo rótulos históricos necessários à consulta. Não reutilizar options de geração que exigem grant generate. Detalhe direto e consultas auxiliares verificam dono e grants; seleção por ID não concede acesso. Estender owner resolution de attachments e auditoria somente se faltar suporte para Receivable, reutilizando fronteiras atuais e cobrindo entrega de bytes. Não retornar dados de remunerações nas projeções.

Query keys estáveis, query options feature-owned e use-data seguem clients. Metadados de refresh e limpeza na troca de identidade/organização usam mecanismos existentes; resumo e página compartilham query do título. Esconder valores com SensitiveValue e demais componentes de visibilidade, inclusive totais, receipts e cancelamentos, sem mudar requests.

## Risks / Trade-offs

- [Estados Parcial e Em atraso se sobrepõem no domínio] → Precedência visual explícita, indicador parcial independente e filtros documentados/testados.
- [Saldo calculado somente na página quebra filtros e totais] → Executar seleção financeira no servidor antes de paginar e testar resultado entre páginas.
- [Reusar listas operacionais exclui contratos encerrados] → Read financeiro parte do título, atravessando ponte apenas para escopo/metadados.
- [Abas aparentam acesso autorizado mas endpoints vazam conteúdo] → Verificar owner em metadata, bytes e auditoria; esconder aba é apenas apresentação.
- [Tabela possui diversos campos financeiros] → Usar scroll interno e preferência tabela/cards existentes, mantendo cards utilizáveis no mobile.

## Migration Plan

Sem migração de banco ou seed. Implementar slice e integrações, atualizar docs canônicos da consulta/estados, regenerar rotas pelo fluxo do projeto e validar. Antes de escrever código, consultar Context7 para APIs das bibliotecas envolvidas, conforme config do OpenSpec. Rollback remove novas rotas/entrada de navegação sem alterar títulos ou baixas persistidos.

## Open Questions

Nenhuma decisão bloqueante para a consulta proposta. Escritas financeiras serão especificadas em mudança própria. Se a implementação revelar necessidade real de alterar persistência, revisar escopo antes de criar migration.
