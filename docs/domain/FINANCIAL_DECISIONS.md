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
| 01 | Valor negociado | Referência separada; financeiro soma duplicatas. Extras podem gerar diferença com motivo. |
| 02 | Primeiro vencimento | Informado explicitamente; demais mensais editáveis; entrada com data própria. |
| 03 | Ajustes após geração | Permitidos com permissão, motivo e histórico; preservar valores já abatidos. |
| 04 | Acréscimos e desconto | Permitir juros, multa e desconto discriminados. |
| 05 | Excedente | Bloquear acima do devido ajustado; sem crédito automático. |
| 06 | Corrigir baixa | Estornar e relançar; evento confirmado não é editado. |
| 07 | Remuneração paga | Bloquear estorno do recebimento enquanto houver pagamento válido correspondente. |
| 08 | Vencimento remuneração | Configuração por filial: corte 25, vence dia 5 seguinte; após corte, mês subsequente. |
| 09 | Várias baixas | Agrupamento rastreável, comprovante compartilhado, estorno individual ou total. |
| 10 | Analítica | Uma por duplicata; baixas seguem classificação do título. |
| 11 | Contrato quitado | Todas receitas ativas com financeiro gerado e todas duplicatas válidas quitadas; andamento independente. |
| 12 | Acesso | Member sempre vinculado a contratos; despesas/diretos exigem autoridade específica e não entram em seu escopo. |
| 13 | Base remuneração | Total efetivamente recebido: inclui juros/multa e considera desconto. |
| 14 | Estorno sem remuneração paga | Cancelar automaticamente obrigações geradas, na mesma transação; novo recebimento gera novas. |
| 15 | Cálculo encargos | Juros e multa manuais; sem cálculo automático por atraso. |
| 16 | Baixa parcial | Principal abatido distinto de caixa: P50 − D5 + J2 = caixa47; saldo de título100 fica50. |
| 17 | Cancelar título | Somente sem baixas válidas; estornar antes quando houver. |
| 18 | Desconto integral | Permitir quitação sem dinheiro com motivo; não gerar remuneração. |
| 19 | Forma de pagamento | Catálogo global; prevista no título, efetiva na baixa; grupo usa uma efetiva. Pix + dinheiro = dois lançamentos. |
| 20 | Ajustes no pagar | Descontos/juros/multa também em pagamentos, inclusive remuneração, com permissão/motivo. |
| 21 | Geração remuneração | Uma Payable por recebimento/participação elegível; pagamento posterior pode agrupar. |
| 22 | Ajustar remuneração | Permitir com motivo/histórico; manter cálculo original; respeitar piso de principal abatido. |
| 23 | Estorno pagamento | Reabrir saldo e reverter principal/desconto/encargos da baixa; preservar original. |
| 24 | Alterar referência | Valor negociado editável com permissão/motivo/histórico; não alterar títulos automaticamente. |
| 25 | Diferença no acerto | Permitir confirmar soma diferente da referência, com justificativa e diferença visível. |
| 26 | Título parcial | Editar valor/vencimento com justificativa; piso é principal abatido incluindo desconto, não caixa líquido. |
| 27 | Meses menores | Último dia do mês quando necessário; retornar dia original nos seguintes; sem ajuste de fim de semana/feriado. |
| 28 | Grupo | Mesma pessoa, filial e direção; origens diferentes permitidas dentro do escopo. |
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
| 45 | Comprovante | Opcional, anexável depois, compartilhado no grupo. |
| 46 | Data estorno | Data própria do estorno; preservar data original da baixa. |
| 47 | Atomicidade | 100% ou nada no grupo, incluindo obrigações de remuneração; nenhuma gravação parcial. |
| 48 | Título quitado | Pode editar com justificativa; aumento reabre saldo; piso preserva principal abatido. |
| 49 | Trocar pessoa | Estornar todas baixas válidas antes. |
| 50 | Estorno errado | Novo lançamento; não desfazer/apagar estorno confirmado. |
| 51 | Reclassificação | Analítica pode mudar sem estorno, com permissão/motivo/histórico; relatórios reclassificam baixas vinculadas. |

## O que não foi autorizado nesta fase

Implementação, reset de banco, alteração de provider/roles no Clerk, publicação ou substituição silenciosa da main. Trabalho atual é documentação e propostas em branch separada. Etapas futuras exigem seguir contratos, dependências e verificações; não precisam rediscutir decisões já registradas.
