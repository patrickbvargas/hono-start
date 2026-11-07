# Verificação

## Entrega

- `/contas-a-pagar` e `/contas-a-pagar/$payableId`, navegação, tabela/cards, filtros/chips, atalhos, totais, ordenação, paginação e máscaras.
- Resumo compacto e workspace com Visão geral, Pagamentos, Anexos e Histórico. Menus de consulta por ID, links contextuais e retorno à seleção anterior.
- Read_own exige beneficiário da Person autenticada e remuneração de contrato atribuído. Mesma seleção antecede opções, totais, páginas e detalhes. Anexos e auditoria preservam esse escopo; pagamentos exigem grant independente.
- Sem migração, nova dependência, seed, escrita financeira ou alteração de dados no banco.

## Provas

- OpenSpec strict: passou.
- `pnpm check`: passou.
- `pnpm build`: passou.
- Vitest final de payables, attachments, audit-logs, related-records, session e contratos arquiteturais afetados: **50 arquivos / 351 testes passaram**.
- Consultas reais somente leitura: **24 títulos**; principal, caixa e saldo confrontados com agregação independente de pagamentos sem estorno; totais iguais entre páginas; opções e resultados de remuneração própria; negação de ID alheio e outra filial. Passou.
- Navegador autenticado: tabela desktop, menu → resumo compacto, pagamento estornado, página dedicada, abas Pagamentos/Anexos/Histórico, cards em 390×844, filtros mobile, seleção Parcial com sobreposição Em atraso e retorno mantendo `state=partial`. Viewport temporário restaurado.

## Limitações globais

`npx tsc --noEmit` permanece com **124 diagnósticos legados**, compatíveis com o estado registrado da entrega anterior de receivables. Nenhum diagnóstico nos arquivos novos ou alterados desta entrega. Não foram adicionadas supressões ou exclusões de compilação. A tarefa 4.2 permanece aberta porque exige TypeScript global limpo.

A execução ampliada inicial incluiu contratos de layout não alterados de Despesas: falharam três testes existentes (fallback de anexos e dois contratos de skeleton/seções). Os dois contratos arquiteturais afetados pela nova slice foram atualizados para reconhecer o barrel e as coleções financeiras somente leitura, e passaram na execução final. Não foram alterados componentes ou expectativas de Despesas.

Não houve troca da conta no navegador nem upload/download de arquivo real; autorização negativa foi exercitada por Vitest e consultas escopadas. Anexos e histórico estavam vazios nos títulos inspecionados. Nenhuma verificação de implantação em produção foi realizada.

## Arquivamento

Arquivado e sincronizado por solicitação explícita do usuário em 2026-11-07, após comunicação das limitações globais. A tarefa 4.2 permanece aberta como registro fiel da validação pendente. O ajuste visual dos filtros de receber/pagar foi adiado explicitamente pelo usuário e não integra este commit.
