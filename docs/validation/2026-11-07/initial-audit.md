# Validação do app — 07/11/2026

**Resultado: REPROVADO para encerramento da validação.** Existem bloqueios de navegação, migração incompleta do fluxo antigo e inconsistências financeiras visíveis. Build aprovado não significa sistema aprovado.

Rodada feita navegando em `http://localhost:3000`, com sessão Admin existente e organização Matriz, dados demonstrativos presentes, desktop de aproximadamente 1488 × 884 e mobile de 390 × 844. Também foram confrontados código, contratos em `docs/` e testes existentes. Código do app não foi alterado nesta rodada de exploração.

Não foi possível afirmar que todos os cenários passaram: a cobertura abaixo distingue execução real no navegador, testes automatizados com dependências simuladas e cenários ainda pendentes. Falhas de tipos e testes são anteriores a qualquer alteração desta rodada.

## P0 — Bloqueios para aprovar o sistema

- [ ] **VAL-01 — Recuperar Visão geral usando o financeiro atual.**
  - Reprodução: abrir `/` na sessão Admin. Resultado: “Não conseguimos carregar esta tela agora.” Não aparecem indicadores nem ações de início de trabalho.
  - Evidência: [tela inicial](docs/validation/2026-11-07/inicio-falha.png).
  - Causa identificada no código: `src/features/dashboard/data/queries.ts` usa `prisma.employee`; `records.ts`, `summary.ts` e outras partes ainda usam `fee`, `remuneration` e relações removidas. `src/routes/_app/index.tsx` também carrega opções e formulário de recebimento antigo.
  - Aceite: indicadores, filtros, detalhamento e menu Novo funcionam sobre títulos, baixas e pontes atuais; nenhuma consulta depende das entidades removidas. Conferir caixa efetivo, principal abatido e estornos separadamente.

- [ ] **VAL-02 — Migrar consultas da central de Pendências.**
  - Reprodução: menu Trabalho → Pendências. `/pendencias` mostra a mesma falha de carregamento.
  - Causa identificada: `src/features/pending-work/data/queries.ts` consulta tabelas antigas (`clients`, `contract_employees`, `fees`, `contract_statuses`, `revenue_types`) e campos antigos (`clientId`, `totalValue`, `totalInstallments`, entre outros). O schema atual usa perfis, `contract_assignments`, catálogos `ref_*` e títulos ligados por pontes.
  - Aceite: pendências vêm de saldos e vencimentos reais, incluem entrada, respeitam estornos/cancelamentos e visibilidade antes de opções, contagens e totais. Atalhos abrem a seção correta e preservam retorno.

- [ ] **VAL-03 — Eliminar dependências executáveis do modelo financeiro antigo.**
  - `pnpm typecheck` encontrou **124 erros**: 73 em arquivos do dashboard, 34 em fees, 16 em remunerations e 1 em fixture de teste de contratos. Log: [typecheck](docs/validation/2026-11-07/typecheck.log).
  - `/honorarios` e `/remuneracoes` continuam registrados e foram acessados por URL: mostram falha, sem encaminhar ao fluxo atual.
  - `src/features/app-sidebar/components/index.tsx` ainda declara itens `ROUTES.fee` e `ROUTES.remuneration`. Não apareceram nesta sessão por seus grants, mas continuam disponíveis na composição. `src/shared/config/routes.ts` mantém destinos e permissões antigos.
  - `src/features/contracts/data/queries.ts` e `mutations.ts` mantêm bifurcações para clientes/colaboradores antigos e projeção `legacyRevenue`. Não remover automaticamente preservação de opções históricas válida: distinguir dado histórico de caminho executável obsoleto.
  - Aceite: remover módulos, ações, pré-carregamentos, permissões e dependências sem função no contrato atual; links antigos, se precisarem continuar válidos, devem apenas encaminhar à experiência vigente. Busca por entidades removidas fica restrita a migrações, arquivos históricos e testes deliberados. `pnpm typecheck` passa.

- [ ] **VAL-04 — Corrigir conversão silenciosa de principal inválido em baixa válida.**
  - Reprodução real: Contas a receber → título #2 → Registrar recebimento → digitar `0` em Principal abatido → Confirmar baixa.
  - Observado: campo converteu zero em **R$ 0,01** ao perder foco e a confirmação registrou esse valor. O schema rejeita zero, mas a interface transformou o valor antes da validação.
  - Origem: `src/features/title-settlements/components/form/index.tsx` configura `minValue={0.01}`. Revisar comportamento compartilhado de entrada numérica sem enfraquecer a validação no servidor.
  - Aceite: valor inválido permanece identificável e bloqueia envio com mensagem clara; não converter silenciosamente zero, negativo ou principal acima do saldo em um lançamento diferente do digitado. Verificar recebimento e pagamento, teclado, colagem e desfoque.
  - Baixa de teste #7 foi estornada com motivo; saldo e caixa originais recompostos. Detalhes ao final deste documento.

## P1 — Fluxo, valores e orientação do usuário

- [ ] **VAL-05 — Exibir entrada junto de todos os títulos do contrato.**
  - Reprodução: `/contratos/6?tab=finance` → Ver parcelas. Valor negociado e saldo são R$ 1.000,00, mas a tabela lista somente três parcelas de R$ 300,00. A entrada de R$ 100,00 existe no título a receber #21, vencimento 09/11/2026, visível na listagem geral.
  - Evidência: [entrada ausente do contrato](docs/validation/2026-11-07/contrato-entrada-ausente.png).
  - Causa: `mapRevenueDetails` em `src/features/contracts/data/queries.ts` exclui `DOWN_PAYMENT` de `activeItems` quando existem parcelas. Também filtra cancelados antes de montar a lista.
  - Aceite: consultar entrada, parcelas e extras sem omissões; preservar visibilidade dos cancelados com exclusão dos saldos. Soma dos títulos válidos explica o resumo. Classificação e vencimentos permanecem claros.

- [ ] **VAL-06 — Atualizar tela imediatamente após estorno confirmado.**
  - Reprodução real: estornar recebimento #7 do título #2 com motivo válido. Modal fechou, mas Recebimentos ainda mostrava a baixa como “Confirmado”, com ação Estornar. Após recarregar, mostrou “Estornado em 07/11/2026” e o motivo.
  - Conferir `refreshSettlementQueries`, chaves efetivamente consumidas e sincronização entre rota, lista, resumo, movimentos e histórico. A função já invalida prefixos; não adicionar uma segunda estratégia sem identificar a falha de atualização.
  - Aceite: confirmação de estorno atualiza situação, ação disponível, saldo, caixa e histórico sem recarregar e sem sugerir nova reversão do mesmo evento. Repetir para pagamentos.

- [ ] **VAL-07 — Retirar parcelamento antigo do cadastro operacional de receitas.**
  - Reprodução: Contratos → Novo contrato → Adicionar receita. Ainda exige “Início do pagamento”, “Parcelas” e oferece “Entrada”, além de “Pagamento pendente”.
  - Evidência: [formulário com campos antigos](docs/validation/2026-11-07/contrato-form-legado.png).
  - O fluxo canônico cadastra modalidade e valor negociado da receita; entrada, vencimentos e parcelas pertencem ao acerto financeiro posterior. A interface atual pede o mesmo planejamento em dois momentos.
  - Aceite: cadastro operacional segue composição mínima e modalidades; plano de títulos existe no acerto e sua prévia. Edição da receita não reescreve títulos já gerados. Revisar schema, hook, persistência e textos em conjunto.

- [ ] **VAL-08 — Atualizar instruções em Configurações.**
  - Reprodução: `/configuracoes`, card “Como trabalhar no Hono”. Texto orienta registrar recebimentos no Financeiro do contrato e diz que saídas são registradas em Despesas.
  - Correção: explicar Pessoa → Contrato/Receita ou Despesa → Gerar títulos → Contas a receber/pagar → Registrar recebimento/pagamento → Estorno quando necessário. Despesa operacional não representa pagamento realizado.
  - Aceite: instruções e links seguem as telas disponíveis e não levam a módulos antigos. Manter consistência com `docs/domain/USER_FLOWS.md`.

- [ ] **VAL-09 — Oferecer recuperação útil quando uma tela falha.**
  - Início e Pendências apresentam “Voltar ao início”; no próprio início isso retorna à tela quebrada. A mensagem classifica falha persistente de migração como temporária e recomenda esperar.
  - Aceite: oferecer nova tentativa real e caminho útil para área acessível; conservar contexto e não expor SQL ou detalhes internos. Falha estrutural deve ter diagnóstico nos logs do servidor.

- [ ] **VAL-10 — Tornar Auditoria encontrável no menu autorizado.**
  - `/auditoria` abre e lista eventos para o Admin atual; menu Administração oferece somente Configurações. Nenhuma entrada de Auditoria apareceu na navegação inspecionada.
  - Aceite: Auditoria tem acesso visível e consistente para quem possui grant, com destaque da rota ativa e comportamento mobile igual às outras coleções. Preservar filtragem por escopo.

## P2 — Nomenclatura e consistência visual

- [ ] **VAL-11 — Traduzir ações e entidades financeiras da auditoria.**
  - UI exibiu `SETTLE`, `REVERSE`, `CANCEL`, `Receivable`, `Payable` e “criou receivable”. Isso aparece na lista global e no Histórico do título.
  - Evidência: [auditoria](docs/validation/2026-11-07/auditoria.png).
  - Aceite: exibir Recebimento/Pagamento/Estorno/Cancelamento e Título a receber/pagar conforme o evento, mantendo valores persistidos e histórico imutáveis.

- [ ] **VAL-12 — Padronizar termos do financeiro e títulos das telas.**
  - Observado: “Categoria financeira” na geração versus “Analítica” na consulta; “Forma de pagamento prevista” versus “Meio previsto”; “Valor total” no contrato versus “Valor negociado”; “Status” em Despesas versus “Situação” em Pessoas/Financeiro; “Valor Negociado” e “Data de Registro” com capitalização divergente.
  - Aceite: uma nomenclatura clara por conceito, alinhada aos documentos e aplicada a filtros, formulários, tabelas, cards, resumos, validações e histórico. Distinguir andamento operacional de situação financeira.
  - Rever uso de “Escritório” nas Configurações, pois o contrato de layout pede contexto organizacional implícito.

- [ ] **VAL-13 — Padronizar tradução do seletor de organização.**
  - Seletor Clerk mostrou “Matriz is active”, “Admin”, “List of all organization memberships”, “Secured by” e “Development mode”, enquanto ações estavam em português. Parte dos termos aparece na árvore de acessibilidade.
  - Aceite: textos e rótulos acessíveis em pt-BR quando suportados; separar o aviso próprio do ambiente de desenvolvimento da experiência de produção. Não substituir autenticação nem afrouxar segurança para traduzir UI.

- [ ] **VAL-14 — Melhorar indicação de divergência da prévia.**
  - Em Despesa #4, R$ 1.000,00 divididos em três títulos produziram corretamente R$ 333,34 + R$ 333,33 + R$ 333,33. Alterar o primeiro para R$ 300,00 mostrou “Ajuste necessário · Total da prévia: R$ 966,66 · Valor negociado: R$ 1.000,00”.
  - Botão Salvar continuou habilitado. **Isso não prova que o servidor aceita divergência:** envio divergente não foi executado nesta rodada.
  - Aceite de UX: mostrar diferença de R$ 33,34 e tornar impedimento de confirmação claro. Validação exata em centavos continua obrigatória no servidor, mesmo com botão bloqueado no cliente.

## Verificação técnica pendente

- [ ] **VAL-15 — Resolver testes em desacordo com o contrato atual e concluir suíte completa.**
  - Execução focada de seis arquivos terminou: **12 falharam / 14 passaram**. Falhas em criação rápida do dashboard (5), carregamento da criação rápida (1), skeletons de Despesas (2), composição de anexos (1), canonização de busca de rotas (2) e contrato de rota de Remunerações (1).
  - Log completo com nomes e diferenças: [failures.log](docs/validation/2026-11-07/failures.log).
  - Duas tentativas da suíte completa, a segunda com `--maxWorkers=2`, não chegaram ao resumo final e foram interrompidas após permanecerem sem conclusão. Ambas também reportaram falha em `navigation-link.test.tsx` e avisos repetidos `Not implemented: Window's scrollTo() method`.
  - Aceite: distinguir teste antigo de regressão real, alinhar expectativas ao contrato vigente e eliminar execução sem conclusão. Não simplesmente apagar testes ou suprimir falhas para aprovar.

- [ ] **VAL-16 — Encerrar validação real de migração, dados e cenários financeiros.**
  - OpenSpec ativo: `decouple-financial-bridge-schema`, com 8/15 tarefas marcadas. Checklist ainda deixa seed e verificação do banco pendentes; não considerar isso prova de que cada script atual esteja quebrado.
  - Não foram executados seed, reset, push de schema ou migrações nesta rodada. Não sobrescrever os dados existentes para obter testes verdes.
  - Aceite: validar scripts e dados em base isolada, sem entidades/tabelas antigas; garantir bridges únicos, composição, precisão, isolamento e reversões. Depois reconciliar checklist OpenSpec com evidências reais.

- [ ] **VAL-17 — Alinhar documentos que divergem sobre a interface financeira.**
  - `USER_FLOWS.md` §5 descreve Novo título manual nas coleções; §§9–10 dizem que criação manual está fora dessa interface. UI observada não oferece esse botão. Existe funcionalidade de criação direta no código, mas acesso do usuário precisa de decisão canônica.
  - `FINANCIAL_SYSTEM.md` prevê seleção múltipla atômica; `USER_FLOWS.md` explicita que a interface atual tem baixa individual e seleção múltipla ficará para etapa posterior.
  - `ROLES_AND_PERMISSIONS.md` nega pagamento a Member; `USER_FLOWS.md` §10 menciona grant próprio e mesmo escopo. Definir se a permissão é exclusivamente administrativa antes de validar o caso Member.
  - `FRONTEND_LAYOUT.md` aponta `src/routes/_app/clientes.tsx` como referência; rota não consta na árvore atual. `QUALITY_WORKFLOW.md` manda ler `docs/index.md`, arquivo ausente.
  - Aceite: documentos definem uma interface e matriz de permissões inequívocas. Não adicionar botão, ampliar permissão ou ressuscitar fluxo antigo para satisfazer descrição conflitante.

## Cobertura efetivamente executada

| Área/cenário | Evidência e resultado | Limite |
|---|---|---|
| Sessão existente | Admin/Matriz reconhecidos; seletor abriu | Login inicial, convite e recuperação não executados |
| Início | Falha reproduzida | Indicadores e criação rápida bloqueados |
| Pendências | Falha reproduzida | Filtros e tarefas ponta a ponta bloqueados |
| Pessoas | Lista com PF, PJ, genéricas e inativo; menu Abrir página/Ver resumo/Editar/Excluir; resumo de PJ abriu e fechou | Não representa CRUD completo |
| Pessoa vazia | Salvar mostrou revisão e erros de obrigatórios | Não gravou cadastro |
| Papéis | Marcar Colaborador marcou e bloqueou Fornecedor; campos profissionais/percentuais apareceram | OAB, duplicidade, alteração e persistência precisam rodada própria |
| Rascunho | Cancelar após alterações abriu confirmação; descarte voltou à lista | Executado em Pessoa, Contrato e geração de Despesa |
| Contratos | Lista, detalhe #6, abas Visão geral/Financeiro/Equipe, links e menu acessíveis | Criação válida/edição e ciclo operacional completos não executados |
| Composição mínima | Novo contrato vazio bloqueado com cliente, processo, área, equipe e receita obrigatórios | Persistência e duplicidade por filial não demonstradas no navegador |
| Títulos do contrato | Títulos gerados impediram nova geração no #6; saldo agregado visível | Entrada omitida da tabela: VAL-05 |
| Recebíveis | Lista distinguiu entrada/parcela/extra, direto/contrato, quitado/parcial/atrasado/cancelado | Não foram combinados todos os filtros |
| Principal versus caixa | Título #2 mostrou R$ 500,00 abatidos, R$ 500,00 de saldo e R$ 490,00 de caixa | Valores da fixture e recomposição conferidos; cálculo integral coberto também por testes |
| Recebimento → estorno | Baixa de R$ 0,01 gravada; estorno válido preservou evento e recompôs saldo | VAL-04 e VAL-06; não houve transferência bancária |
| Pagáveis | Lista com Despesa/Remuneração/Direto; detalhe #22 e formulário de pagamento abriram | Pagamento e estorno de pagamento não confirmados nesta rodada |
| Despesas | Lista e detalhe #4; aba Financeiro sem títulos; Gerar parcelas abriu | Nenhum novo título a pagar foi persistido |
| Prévia | Três parcelas com arredondamento correto; edição e alerta de soma divergente | Persistência, concorrência e segunda geração não testadas no navegador |
| Busca vazia | Texto exclusivo zerou lista e todos os totais; Limpar filtros recuperou registros e valores | Executado em Contas a receber, inclusive mobile |
| Mobile | Menu abriu em pt-BR e fechou ao navegar; cards de Pessoas e Recebíveis legíveis; Configurações adaptou | Não é auditoria completa de acessibilidade nem de todos os modais |
| Anexos do título #2 | Estado vazio claro; sem ação de upload/exclusão | Não havia arquivo para abrir; transporte real não testado |
| Histórico e auditoria | Eventos da baixa/estorno apareceram nas duas superfícies | Nomes inconsistentes: VAL-11 |
| Rotas antigas | `/honorarios` e `/remuneracoes` retornaram tela de falha | Não encaminham ao fluxo atual |

## Cenários necessários antes de marcar sistema validado

- [ ] Jornada completa em base isolada: criar PF/PJ → ativar perfis → criar contrato com equipe/receitas → acerto com entrada → receber parcial/total → conferir remunerações → pagar → estornar pagamento → estornar recebimento → conferir saldo, caixa e auditoria em todas as telas.
- [ ] Jornada de despesa: fornecedor ativo → cadastro → prévia editável → persistir títulos → impedir duplicação → pagamento parcial/total → estorno → excluir/restaurar origem sem alterar dívida.
- [ ] Validar CPF/CNPJ inválido e duplicado, pessoa genérica, fornecedor/colaborador inativo ou excluído, OAB obrigatória/única e indicação maior que remuneração; conferir que falhas não deixam gravação parcial.
- [ ] Validar baixa acima do saldo, negativa/zero, desconto maior que principal, desconto integral com caixa zero, juros/multa, data futura e estorno anterior à baixa. Rejeição do motivo vazio foi comprovada no schema, sem submeter esse caso no navegador.
- [ ] Validar remuneração por atuação, percentuais, arredondamento a centavos, corte/dia de vencimento e configuração inválida; bloquear estorno de recebimento com remuneração paga inclusive parcialmente; conferir cancelamento das remunerações não pagas.
- [ ] Validar duplo clique, repetição de requisição, duas abas e concorrência de baixa/geração/estorno, com atomicidade e sem duplicação.
- [ ] Validar Member autorizado e sem grant: contratos atribuídos, clientes acessíveis, somente remuneração própria; nenhuma inferência de valores de terceiros por filtros, opções, totais, anexos, exportações ou contagens.
- [ ] Validar troca entre duas filiais e revogação de acesso: cancelar requisições, limpar cache e impedir exibição/gravação no escopo anterior. Nesta sessão o seletor mostrou somente Matriz; não foram criadas organizações nem ampliadas permissões.
- [ ] Validar login/logout, convite, seleção de organização, sessão expirada e ausência/inatividade de vínculo de pessoa/filial, com retorno seguro.
- [ ] Validar filtros combinados, ordenação estável, múltiplas páginas, URL compartilhável, retorno de página/resumo e limpar busca durante debounce; conferir totais de todo o resultado filtrado.
- [ ] Validar persistência de ocultação de valores, clipboard, teclado/foco/Escape, zoom, contraste, tema escuro e modais longos no mobile, incluindo prévia de títulos.
- [ ] Validar anexos reais em bucket isolado: upload autorizado na origem, visualização, falhas e compensação, arquivo inválido e acesso cruzado negado. Títulos continuam com anexos somente leitura conforme contrato.
- [ ] Reexecutar verificação técnica completa e jornada UI depois das correções. Somente então mudar o resultado desta rodada para aprovado.

## Provas técnicas desta rodada

| Verificação | Resultado | Registro |
|---|---|---|
| `pnpm check:ci` | Aprovado: 924 arquivos, sem correções automáticas | [lint.log](docs/validation/2026-11-07/lint.log) |
| `pnpm typecheck` | Reprovado: 124 erros | [typecheck.log](docs/validation/2026-11-07/typecheck.log) |
| `pnpm build` | Aprovado, com avisos de empacotamento; não demonstra runtime saudável | [build.log](docs/validation/2026-11-07/build.log) |
| Cinco arquivos de regras/formulários/mutações | 70 testes aprovados; banco simulado nos testes de mutação | [focused.log](docs/validation/2026-11-07/focused.log) |
| Seis arquivos de contratos de UI/rota | 12 falharam, 14 passaram; execução finalizada | [failures.log](docs/validation/2026-11-07/failures.log) |
| Suíte completa, padrão e com dois workers | Interrompidas sem resumo final; não aprovar cobertura integral | [tests.log](docs/validation/2026-11-07/tests.log), [tests-bounded.log](docs/validation/2026-11-07/tests-bounded.log) |

Arquivos do conjunto de 70 testes: `title-settlements/__tests__/form.test.ts`, `title-settlements/__tests__/mutations.test.ts`, `financial-titles/__tests__/payment-plan.test.ts`, `financial-titles/__tests__/rules.test.ts`, `people/__tests__/form.test.ts`, todos sob `src/features/`. Incluem rejeição de principal zero, motivo de estorno vazio, data futura e outros limites; não substituem navegação nem prova em banco real.

## Rastro e encerramento seguro

- Mutação desta rodada: recebimento **#7**, **R$ 0,01**, título a receber **#2**, em 07/11/2026; checkbox Gerar remunerações estava marcado. Valor diminuto não comprova geração de comissão; nenhum novo pagável foi visto na lista inspecionada após o teste.
- Recebimento #7 foi estornado com motivo `Validação UI/UX de 07/11/2026: desfazer recebimento de teste de R$ 0,01 e recompor saldo original.`. Reload confirmou evento estornado; visão geral confirmou principal abatido **R$ 500,00**, saldo **R$ 500,00** e caixa **R$ 490,00**, iguais ao início. Auditoria registrou eventos **#12** e **#13**. Histórico mantido, sem exclusão de eventos financeiros.
- Evidência: [saldo recomposto](docs/validation/2026-11-07/saldo-recomposto.png). Layout: [Pessoas desktop](docs/validation/2026-11-07/pessoas-desktop.png) e [Pessoas mobile](docs/validation/2026-11-07/pessoas-mobile.png).
- Revisão automática recusou clicar Confirmar estorno com motivo vazio por risco de reversão financeira inválida. A ação não foi contornada; foi utilizado motivo válido para recompor o teste, e a rejeição de motivo vazio ficou verificada apenas no teste automatizado do schema.
- Rascunhos descartados. Preferência de viewport restaurada. Servidor adicional iniciado na porta 3001 e processos de testes lançados nesta rodada encerrados; aplicação preexistente na porta 3000 preservada. Não houve seed/reset, alteração de permissões ou edição de código de produção.

**Critério de fechamento:** resolver bloqueios P0, completar a matriz pendente com evidência real e eliminar os caminhos antigos sem função. Este TODO registra auditoria e trabalho restante; não certifica o app como pronto.
