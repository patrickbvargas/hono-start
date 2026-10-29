# Registro das decisões financeiras aprovadas

Data: 29/10/2026. Este registro preserva decisões do usuário sem depender da conversa. [FINANCIAL_SYSTEM.md](FINANCIAL_SYSTEM.md) organiza regras normativas; [roadmap](../implementation/FINANCIAL_ROADMAP.md) determina execução. Nenhuma aprovação de desenho significa funcionalidade já implementada.

## Modelo e fronteiras

- Operacional: Contract e Expense. Revenue e equipe pertencem ao Contract.
- Financeiro: Receivable, Receipt, Payable, Payment. Cada duplicata é um título, incluindo entrada, parcela ou extra.
- Cadastro único de pessoas, com papéis acumuláveis. EmployeeProfile contém dados profissionais.
- Acerto financeiro é a fronteira de geração dos títulos. Não haverá módulo Pedido/NF nesta implementação.
- Financeiro permite títulos diretos, sem documento operacional fictício, sempre com pessoa e origem explícita.
- Toda duplicata identifica devedor/beneficiário: sempre se recebe de/paga a alguém.
- Expense sempre tem campo notes/Observações. Contract e Expense mantêm anexos.
- Remuneração é uma Payable; RemunerationCalculation separado preserva memória estruturada. Não reintroduzir uma segunda obrigação Remuneration.
- Apenas recebimentos de contratos geram remunerações; receber valor de outra origem para o escritório não remunera colaboradores.
- Duplicatas genéricas permanecem concisas. Dados específicos de origem ficam em vínculos/evidência complementar.
- Base atual não contém dados reais. Pode ser recriada em desenvolvimento na implementação, sem migração dos registros fictícios. Nesta etapa não executar reset.

## Decisões sequenciais

| Nº | Tema | Decisão final |
|---|---|---|
| 01 | Valor negociado | Referência separada; no acerto, soma de todas as duplicatas, incluindo entrada, deve igualar o total acordado. Após geração, ajustes/extras podem gerar diferença com motivo. |
| 02 | Primeiro vencimento | Informado explicitamente; demais mensais editáveis; entrada com data própria. |
| 03 | Ajustes após geração | Permitidos com permissão, motivo e histórico; preservar valores já abatidos. |
| 04 | Acréscimos e desconto | Permitir juros, multa e desconto discriminados. |
| 05 | Excedente | Bloquear acima do devido ajustado; sem crédito automático. |
| 06 | Corrigir baixa | Estornar e relançar; evento confirmado não é editado. |
| 07 | Remuneração paga | Bloquear estorno do recebimento enquanto houver pagamento válido correspondente. |
| 08 | Vencimento remuneração | Configuração por filial: corte 25, vence dia 5 seguinte; após corte, mês subsequente. |
| 09 | Várias baixas | Receber e pagar usam seleção múltipla atômica sem entidade de lote/grupo; cada baixa mantém vínculo, data, forma efetiva, histórico e comprovante próprios. |
| 10 | Analítica | Uma por duplicata; baixas seguem classificação do título. |
| 11 | Contrato quitado | Todas receitas ativas com financeiro gerado e todas duplicatas válidas quitadas; andamento independente. |
| 12 | Acesso | Member sempre vinculado a contratos; despesas/diretos exigem autoridade específica e não entram em seu escopo. |
| 13 | Base remuneração | Total efetivamente recebido: inclui juros/multa e considera desconto. |
| 14 | Estorno sem remuneração paga | Cancelar automaticamente obrigações geradas, na mesma transação; novo recebimento gera novas. |
| 15 | Cálculo encargos | Juros e multa manuais; sem cálculo automático por atraso. |
| 16 | Baixa parcial | Principal abatido distinto de caixa: P50 − D5 + J2 = caixa47; saldo de título100 fica50. |
| 17 | Cancelar título | Somente sem baixas válidas; estornar antes quando houver. |
| 18 | Desconto integral | Permitir quitação sem dinheiro com motivo; não gerar remuneração. |
| 19 | Forma de pagamento | Catálogo global; prevista no título, efetiva na baixa. Ação múltipla de recebimentos ou pagamentos usa uma forma efetiva comum, persistida em cada baixa. Pix + dinheiro = dois lançamentos. |
| 20 | Ajustes no pagar | Descontos/juros/multa também em pagamentos, inclusive remuneração, com permissão/motivo. |
| 21 | Geração remuneração | Uma Payable por recebimento/participação elegível; pagamento posterior pode agrupar. |
| 22 | Ajustar remuneração | Permitir com motivo/histórico; manter cálculo original; respeitar piso de principal abatido. |
| 23 | Estorno pagamento | Reabrir saldo e reverter principal/desconto/encargos da baixa; preservar original. |
| 24 | Alterar referência | Valor negociado editável com permissão/motivo/histórico; não alterar títulos automaticamente. |
| 25 | Diferença no acerto | Revisada em 29/10/2026: bloquear geração se a soma for menor ou maior que o total acordado, mesmo com justificativa; validar em centavos no servidor. Ajustes após geração permanecem permitidos conforme decisões 03/26/48. |
| 26 | Título parcial | Editar valor/vencimento com justificativa; piso é principal abatido incluindo desconto, não caixa líquido. |
| 27 | Meses menores | Último dia do mês quando necessário; retornar dia original nos seguintes; sem ajuste de fim de semana/feriado. |
| 28 | Seleção múltipla | Ambos permitem pessoas e origens diferentes, na mesma filial, direção, data e forma efetiva; sem ReceiptBatch/PaymentBatch/lote/subgrupos por pessoa. Validar permissão e saldo por título; tudo ou nada. |
| 29 | Evento remunerador | Somente receber; opção Gerar remunerações por lançamento; nunca mero agendamento/conclusão. |
| 30 | Login | Clerk ligado a Pessoa com perfil ativo; papéis comerciais não dão acesso. |
| 31 | Sigilo Member | NUNCA conhecer remuneração de outro colaborador, nem por totais, relatórios, anexos ou histórico. |
| 32 | Member registra recebimento | Permissão existe, padrão false, somente em contratos atribuídos. Planejar Member/Admin; limite Clerk em produção é ponto a verificar. |
| 33 | Diretos | Member não acessa títulos diretos; exigir permissão financeira específica no contexto autorizado. |
| 34 | Analíticas remuneração | Catálogo global existente: LAWYER → Folha Advogados; ADMIN_ASSISTANT → Folha Funcionários. Não criar catálogo por filial. |
| 35 | Pessoa obrigatória | Todo receber/pagar tem pessoa, inclusive imposto, energia e lançamento direto. |
| 36 | Cancelar origem | Preservar títulos e baixas; financeiro trata obrigações separadamente. |
| 37 | Reabertura | Estorno muda situação financeira, não andamento operacional automaticamente. |
| 38 | Preview acerto | Herdar/informar total, entrada, quantidade e primeiro vencimento; pré-calcular tabela editável; confirmar tudo numa transação. |
| 39 | Centavos | Diferença de arredondamento na última parcela. |
| 40 | Previsão parcial | Parte abatida/recebida e parte pendente; previsão usa saldo, realizado usa dinheiro efetivo. |
| 41 | Vencimento residual | Mantém original até ajuste autorizado. |
| 42 | Fora de ordem | Pode baixar qualquer título com saldo, inclusive futuro; sugerir vencidos primeiro sem bloquear sequência. |
| 43 | Origem encerrada | Baixas de títulos válidos continuam possíveis em contrato concluído/cancelado. |
| 44 | Data futura | Bloquear baixa futura; aceitar hoje/passado. |
| 45 | Comprovante | Opcional, anexável depois, vinculado à baixa individual (Receipt/Payment), sem lote. |
| 46 | Data estorno | Data própria do estorno; preservar data original da baixa. |
| 47 | Atomicidade | 100% ou nada na seleção, incluindo obrigações de remuneração; nenhuma gravação parcial. |
| 48 | Título quitado | Pode editar com justificativa; aumento reabre saldo; piso preserva principal abatido. |
| 49 | Trocar pessoa | Estornar todas baixas válidas antes. |
| 50 | Estorno errado | Novo lançamento; não desfazer/apagar estorno confirmado. |
| 51 | Reclassificação | Analítica pode mudar sem estorno, com permissão/motivo/histórico; relatórios reclassificam baixas vinculadas. |

## Pagamentos múltiplos simplificados — 29/10/2026

Selecionar N duplicatas a pagar de quaisquer beneficiários autorizados, conferir valores (saldo integral por padrão, parcial e ajustes por linha permitidos), informar data/forma comuns e confirmar uma única vez. Exemplo: dez duplicatas de vários advogados, total R$ 5.000. Gravar um Payment por duplicata numa transação, sem lote e sem agrupamento por pessoa. Uma linha inválida cancela toda a operação. Preservar idempotência e auditoria técnicas, comprovantes e estornos por Payment e sigilo absoluto do Member. Decisão posterior: a mesma simplificação também vale para receber; ReceiptBatch é removido junto de PaymentBatch.

## Validação posterior do fluxo — 29/10/2026

- Sem campo mês/ano de competência nesta versão. Vencimento orienta previsão; data efetiva da baixa/estorno orienta realizado. Não inferir competência pelo vencimento.
- Saldos a pagar e receber por pessoa, separados e limitados à filial/escopo autorizado, sem compensação automática e sem exposição de remunerações alheias.
- Confirmados: seleção livre de parcelas (sem ordem obrigatória), baixa individual/múltipla e total/parcial, juros/multa/desconto, origens extensíveis e analítica em toda duplicata.
- Vencimento não registra recebimento/pagamento automaticamente. Antecipações totais/parciais e baixas em atraso usam a data efetiva, nunca futura.
- A revisão da decisão 25 substitui a autorização anterior de diferença justificada no acerto; não restringe os ajustes posteriores já aprovados.

## O que não foi autorizado nesta fase

Implementação, reset de banco, alteração de provider/roles no Clerk, publicação ou substituição silenciosa da main. Trabalho atual é documentação e propostas em branch separada. Etapas futuras exigem seguir contratos, dependências e verificações; não precisam rediscutir decisões já registradas.

## Cadastros separados visualmente — 29/10/2026

Clientes, Fornecedores e Colaboradores permanecem telas e itens separados no sidebar. Banco mantém uma Person com papéis acumuláveis e EmployeeProfile opcional. Gestão de percentuais/OAB/acesso pertence à tela autorizada de Colaboradores. Member não acessa Fornecedores/Colaboradores nem seus endpoints/opções/totais/exportações. Projeção de Cliente não expõe perfil profissional, percentuais ou dados de acesso da mesma pessoa. Preservar apenas os dados de equipe já permitidos no contrato atribuído e a própria remuneração; isso não abre o cadastro de colaboradores.

## Dimensões dos contratos no financeiro — 29/10/2026

Permitir filtros/agrupamentos por área do contrato, tipo da receita e tipo de participação (AssignmentType), além da analítica. Receivable deriva de Revenue/Contract; remuneração Payable deriva do seu cálculo, recebimento e participação exata. Despesas/diretos ficam “Sem vínculo com contrato”. Não criar colunas específicas de contratos nas duplicatas genéricas. Vários participantes não duplicam linhas, contagens ou total geral. Agrupamentos de recebíveis por tipos de participação podem se sobrepor e devem ser explicitamente não aditivos, sem ratear valores; remuneração usa apenas sua participação de origem. Respeitar filial/escopo/sigilo antes de agregar e nas opções/exportações.

## Receber e pagar simétricos, sem lotes — decisão final

Selecionar N duplicatas de pessoas/origens diferentes, ajustar principal/desconto/juros/multa por linha e confirmar tudo ou nada; uma direção e filial por ação. Cada título gera seu próprio Receipt ou Payment. Ambos têm forma/tipo de pagamento efetiva e data da baixa, além da forma prevista no título, usando PaymentMethod global. Forma/data comuns informadas na ação são copiadas para cada evento. Não há ReceiptBatch nem PaymentBatch, subgrupos por pessoa ou comprovante de lote. Comprovantes/estornos são individuais; idempotência/correlação de auditoria são técnicas. Gerar remunerações na confirmação de receber persiste a opção em cada Receipt, mas somente linhas elegíveis de contrato geram obrigações. Esta decisão substitui quaisquer referências anteriores a lotes/grupos de recebimentos.
