# Implementação e validação — 07/11/2026

Proposta arquivada: `openspec/changes/archive/2026-11-07-complete-app-workflow-validation/` (OpenSpec). Especificação sincronizada em `openspec/specs/app-workflow-convergence/spec.md`. Código implementado; aprovação integral do ambiente permanece condicionada ao TODO.

## Correções entregues

- Visão geral e Pendências usam títulos, pontes e movimentações atuais. Principal, caixa, remuneração gerada e pagamento são medidas distintas. Reversões afetam o caixa na data efetiva correspondente.
- Escopo da filial, contratos atribuídos e remuneração própria são aplicados antes das projeções. Opções de clientes/colaboradores e auditoria respeitam a visibilidade atual; histórico de perfis mistos não concede acesso a dados de outro perfil.
- Módulos `fees`/`remunerations` e seus grants/consumidores antigos foram removidos. Rotas antigas redirecionam às coleções atuais sem reutilizar os IDs antigos.
- Receita operacional contém modalidade, valor negociado e observações. Entrada/parcelas/extras pertencem à geração financeira. Resumo do contrato inclui todos os títulos, inclusive cancelados, excluindo estes dos saldos.
- Valores inválidos de baixa permanecem visíveis até a validação; nenhuma conversão de zero em R$0,01. Atualização após baixa/estorno alcança consultas ativas e inativas, movimentos, saldos, Pendências e auditoria.
- Prévia informa a diferença em reais e bloqueia salvar quando a soma não confere. Menu Auditoria, nomes financeiros, ajuda, recuperação de erros e datas do calendário de São Paulo foram alinhados.
- Anexos usam os oito donos atuais. Transporte privado existente preservado; upload financeiro permanece indisponível.
- Contratos canônicos e testes foram atualizados. Utilitários de planejamento antigo sem consumidores foram removidos.

## Navegação comprovada nesta implementação

Sessão Admin, organização Matriz, dados demonstrativos existentes. Conferência em desktop e em 390 × 844. Não houve nova baixa válida, alteração de cadastro, reset, seed ou migração nesta implementação.

| Cenário | Resultado observado |
| --- | --- |
| Início | Indicadores e gráficos carregaram após substituir consultas antigas; leitura financeira usa transação consistente com limite explícito de 15s para conexão remota. |
| Resultado → detalhamento → Dados → fechar | Total R$10.290; recebimentos R$11.490,01 − pagamentos R$1.685 + estornos de pagamento R$1.485 − estornos de recebimento R$1.000,01. Retorno preservou a tela. |
| Pendências | Cinco registros, incluindo títulos atrasados, geração ainda pendente e vencimento próximo; R$3.500 no contrato DEMO-1-001. |
| Contrato #6 → Financeiro → Ver parcelas | Entrada #21 de R$100 e parcelas #22–24 de R$300, total R$1.000. |
| Contrato → Editar → Receita → Cancelar | Tipo, valor negociado e observações; campos do parcelamento antigo ausentes. Nenhuma gravação. |
| Título #2 → Registrar recebimento → principal zero → Tab → confirmar | Zero permaneceu R$0,00. Envio bloqueado com “Principal deve ser positivo e não pode superar o saldo atual.” Saldo R$500 e caixa R$490 preservados. |
| Auditoria pelo menu | Eventos existentes exibidos como Baixa/Estorno e Título a receber/pagar; nenhum evento novo criado pelo zero inválido. |
| URLs antigas | `/honorarios` → Contas a receber; `/remuneracoes/999` → Contas a pagar. |
| Mobile | Indicadores empilhados; menu agrupado acessível; Pendências em cards; seleção de destino retorna ao conteúdo. |
| Seletor de organização | Ações principais em português; trechos internos de acessibilidade e identificação do SDK permanecem em inglês, registrados no TODO. |

A auditoria exploratória anterior fez uma baixa de R$0,01 e a estornou; esse histórico foi preservado em `initial-audit.md`. Não foi repetido como nova baixa nesta implementação.

## Provas automáticas

- Tipos: `implementation-typecheck.log`.
- Lint: checagem final sem escrita aprovada (`final-lint.log`); formatação em `implementation-lint.log`.
- Regressões finais do dashboard e auditoria: 112 testes aprovados em `dashboard-final.json`.
- Suíte completa: 1.195 testes aprovados, zero falhas, em 228 arquivos (`verified-results.json`). Comando padrão `pnpm test`, com relatório JSON.
- Build de produção aprovado (`implementation-build.log`). Uma primeira tentativa encontrou EPERM transitório na saída gerada; a repetição do mesmo comando passou sem alteração de permissões ou código.
- OpenSpec: validação estrita aprovada em `openspec-validation.log`.
- Banco real: 11 cenários de integridade financeira executados com rollback, zero tabelas antigas. Verificador geral **reprovado**: três pontes sem RLS, sem SELECT para anon/authenticated. Detalhes em `database-verification.log` e `database-access-review.json`. O teste de vínculo entre filiais foi corrigido para provocar a restrição de chave estrangeira sem colidir primeiro com a unicidade do vínculo existente.

## Limites

Não foram executadas nesta sessão jornadas reais Member, duas filiais, revogação/convite, concorrência em duas abas nem transporte de anexos no bucket isolado. Também falta repetir a jornada financeira completa de criação até estorno em base isolada. Cobertura simulada não foi apresentada como prova desses cenários reais.

## Evidências visuais

- `inicio-restaurado.jpg`
- `inicio-mobile.jpg`
- `pendencias-mobile.jpg`
- `principal-zero-bloqueado.jpg`
- `resultado-conciliado.jpg`
