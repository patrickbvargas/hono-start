## 1. Contratos e preparação

- [x] 1.1 Reler documentação canônica e comparar clients, despesas, RelatedRecordLink e seus menus, filtros, drawer e workspace. Consultar Context7 para APIs das bibliotecas envolvidas antes de implementar.
- [x] 1.2 Registrar em DOMAIN_MODEL e USER_FLOWS a consulta proposta, a precedência visual Cancelado/ Quitado/ Em atraso/ Parcial/ Pendente e a sobreposição intencional do filtro Parcial com atraso. Manter demais regras financeiras.
- [x] 1.3 Confirmar esquema de pontes disponível e suporte dos owners de anexos/auditoria. Não há migração de banco prevista; não executar reset, seed ou mudança da proposta de desacoplamento.

## 2. Read models e autorização

- [x] 2.1 Criar schemas de modelo, filtro, search, sort e workspace em receivables, defaults e catálogo de erros seguros, seguindo clients. Cobrir validação de IDs, datas, lookup values, tab e returnTo.
- [x] 2.2 Estender os escopos existentes de shared/session para receivables e aplicar read_all/read_assigned por Firm e ponte/atribuição. Cobrir grants ausentes, título direto, outra filial, contrato não atribuído e origem operacional encerrada.
- [x] 2.3 Implementar cálculos exatos de principal, saldo, caixa e estados, incluindo cancelados, estornos, desconto integral e data civil São Paulo. Cobrir centavos e fronteiras de vencimento em Vitest.
- [x] 2.4 Implementar seleção filtrada, ordenação estável e paginação no servidor, aplicando filtros derivados antes de paginar. Retornar count e totais do conjunto completo com snapshot coerente e testar filtros, páginas e cancelados.
- [x] 2.5 Implementar detalhe e opções escopadas por títulos acessíveis, mapeamento de read models com Zod, server functions protegidas, query keys/options e hooks use-data. Reutilizar invalidação existente e renovar estados na virada do dia/foco.

## 3. Coleção responsiva

- [x] 3.1 Criar use-filter e composição ListFilters com busca, devedor, contrato, origem, classificação, situação, vencimento/atalhos, analítica e meio previsto; manter chips, debounce, clear e filtros mobile no padrão existente.
- [x] 3.2 Criar columns.tsx e tabela DataTable com valores mascaráveis, ordenação suportada, valor nominal ao final, Pagination e menus dropdown/contexto compartilhando ações por ID.
- [x] 3.3 Criar cards DataCardList com mesma seleção e ações, navegação principal e dropdown acessível no mobile. Usar EntityView e alternância desktop existentes.
- [x] 3.4 Compor rota da coleção com Wrapper/Header/Body, loader/prefetch, resumo filtrado, useEntityOverlay/detailId, ListEmptyState, RouteLoading e erro seguro; preservar o filtro controller único e não exibir ações de escrita fora do escopo.

## 4. Resumo e página com abas

- [x] 4.1 Criar seções reutilizáveis de Visão geral e Recebimentos, diferenciando principal e caixa e preservando eventos/reversões; exigir grants próprios para eventos de recebimento.
- [x] 4.2 Compor ReceivableDetails com EntityDetail e skeletons existentes; implementar abertura/fechamento por detailId sem alterar busca, sort ou página da lista.
- [x] 4.3 Criar workspace com EntityWorkspace, abas Visão geral/Recebimentos/Anexos/Histórico, search validado, fallback de aba restrita e retorno à coleção preservado. Não incluir botões de CRUD financeiro nesta consulta.
- [x] 4.4 Integrar consulta de anexos e auditoria pelos barrels públicos e estender resolução do owner Receivable somente onde necessário. Cobrir metadata, preview/download/bytes e histórico negados fora do escopo, sem habilitar escrita de anexos.
- [x] 4.5 Integrar receivable ao RelatedRecordLink, lazy-loading e overlay local; reutilizar links de devedor/contrato conforme acesso e evitar acionamento simultâneo de link/menu e ação principal.
- [x] 4.6 Criar rota dedicada com prefetch e validação de ID; registrar Contas a receber em ROUTES e navegação com grants explícitos, regenerar árvore de rotas e preservar rota legada.

## 5. Prova e revisão

- [x] 5.1 Adicionar testes focados de rota/search/prefetch, query keys sem detailId, troca de organização, resumo versus página, abas autorizadas, menus equivalentes e retorno preservado. Atualizar contratos arquiteturais afetados sem relaxar fronteiras.
- [x] 5.2 Verificar visualmente desktop e mobile: tabela/cards, filtros/chips, context menu/dropdown/teclado, resumo, abas, scroll, paginação, esconder valores, vazio/loading/erro e registros cancelados/sem ponte/parciais/estornados.
- [x] 5.3 Revisar ownership, imports públicos, layout e convenções contra docs e referências. Confirmar ausência de migrations, novas dependências, writes financeiros e exposição de remunerações.
- [ ] 5.4 Executar Vitest pertinente, `pnpm check` e depois `npx tsc --noEmit`; corrigir falhas antes de concluir. Registrar resultados reais e eventuais limitações da verificação visual.

Resultados e limitações registrados em `verification.md`. A tarefa 5.4 permanece aberta pelo TypeScript global preexistente (125 erros no HEAD original, 124 no checkout atual; zero novos diagnósticos).
