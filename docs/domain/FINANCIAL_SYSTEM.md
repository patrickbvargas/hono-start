# Financial System — Target Contract

Este documento define o contrato canônico do sistema financeiro.
O motor financeiro é 100% desacoplado de origens operacionais e utiliza tabelas de ponte.

---

## 1. Princípios e Fronteiras

1. **Financeiro Agnóstico**: `Receivable` (a receber) e `Payable` (a pagar) contêm apenas dados monetários, vencimento, analítica e contraparte. Não possuem FKs de contratos, despesas ou código de geração.
2. **Classificação Nativa (`kind`)**: Campo enum direto no título (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`). Não existe tabela de lookup para classificação.
3. **Contrapartes Obrigatórias**:
   - Todo `Receivable` possui devedor (`debtorId`) referenciando `ClientProfile`.
   - Todo `Payable` possui beneficiário (`beneficiaryId`) referenciando `SupplierProfile`.
   - Pessoas genéricas (`isGeneric = true`) permitem lançamentos consolidados (ex: tarifas bancárias, recebimentos avulsos) sem CPF/CNPJ.
4. **Isolamento de Filial**: Todo título, liquidação e comprovante pertence a uma `Firm`. Não existem operações cruzadas entre filiais.

---

## 2. Handoff Operacional via Tabelas de Ponte

Origens operacionais não injetam colunas em duplicatas. O vínculo ocorre exclusivamente por tabelas de ponte:

1. **Receitas de Contratos (`ContractRevenueReceivable`)**:
   - O acerto financeiro do contrato herda o valor negociado da `Revenue`.
   - Gera prévia editável com entrada e parcelas.
   - **Trava de fechamento**: A soma de todos os títulos da prévia deve igualar o valor negociado exatamente em centavos ($\sum \text{títulos} = \text{valor negociado}$).
   - A confirmação cria atomicamente os `Receivables` e insere os registros na ponte `ContractRevenueReceivable`.
2. **Despesas Operacionais (`ExpensePayable`)**:
   - A despesa herda fornecedor (`SupplierProfile`) e valor negociado.
   - A confirmação gera os `Payables` e registra na ponte `ExpensePayable`.
3. **Lançamentos Manuais Diretos (Sem Ponte)**:
   - Duplicatas avulsas (ex: contas de consumo, custas avulsas) são criadas diretamente no financeiro.
   - Não possuem registro em nenhuma tabela de ponte. O motivo fica em `notes` e o responsável no `AuditLog`.

---

## 3. Liquidações (Baixas)

Cada `Receipt` abate exatamente um `Receivable`. Cada `Payment` abate exatamente um `Payable`.

### Equação do Caixa Real
$$\text{Caixa Efetivo } (C) = P - D + J + M$$
- $P$ = Principal abatido ($0 < P \le \text{saldo devedor}$).
- $D$ = Desconto ($0 \le D \le P$).
- $J$ = Juros ($\ge 0$).
- $M$ = Multa ($\ge 0$).
- O caixa efetivo $C$ nunca pode ser negativo.
- Desconto integral ($P = D$, $J = M = 0 \implies C = 0$) é válido para quitação sem dinheiro, mas não gera remuneração.

### Seleção Múltipla Atômica
- O usuário pode selecionar $N$ títulos autorizados da mesma filial e direção.
- Informa data efetiva (hoje ou passado, nunca futura) e forma de pagamento real (`actualPaymentMethodId`).
- Confirmação grava $1$ `Receipt` ou `Payment` por título selecionado numa única transação atômica.
- Falha em qualquer título reverte todas as baixas. Não existe entidade de lote ou agrupamento persistido.

---

## 4. Motor de Remuneração da Equipe (`RemunerationPayable`)

Apenas recebimentos confirmados de contratos com flag `generatesRemuneration = true` disparam remunerações.

1. **Base de Cálculo**: Incide sobre o **caixa efetivo real** $C$ da baixa (inclui juros/multa manuais e deduz desconto), nunca sobre valor de face.
2. **Geração Atômica**:
   - Para cada participante elegível em `ContractAssignment`:
   - Aplica o percentual efetivo e calcula o valor.
   - Cria o registro na ponte `RemunerationPayable` com snapshot das regras aplicadas (`ruleSnapshot`).
   - Cria atomicamente a duplicata `Payable` apontando para o `SupplierProfile` do colaborador.
3. **Régua de Vencimento**:
   - A filial configura `remunerationCutoffDay` (padrão 25) e `remunerationDueDay` (padrão 5).
   - Baixa até o dia 25: vence no dia 5 do mês seguinte.
   - Baixa após o dia 25: vence no dia 5 do segundo mês subsequente.
   - Dias inexistentes no mês ajustam para o último dia do mês.

---

## 5. Estornos e Reversões Imutáveis

Liquidações confirmadas nunca são editadas ou deletadas. Correções usam estorno append-only (`ReceiptReversal` e `PaymentReversal`).

1. **Efeito do Estorno**:
   - Reabre o saldo devedor do título.
   - Reverte o fluxo de caixa na data do estorno (preserva a data histórica da baixa original).
2. **Trava de Dependência de Remuneração**:
   - Ao estornar um `Receipt`:
   - Se **qualquer** `Payable` de remuneração gerado já foi pago (possui `Payment`), o estorno do recebimento é **bloqueado**. Exige estornar os pagamentos dos colaboradores primeiro.
   - Se nenhum foi pago: cancela atomicamente os `Payables` de remuneração e registra o estorno do recebimento.

---

## 6. Dimensões e Relatórios

Os relatórios combinam dados financeiros e operacionais através das pontes:
- **Fluxo de Caixa Projetado**: Soma saldos de títulos abertos por data de vencimento.
- **Fluxo de Caixa Realizado**: Soma caixas efetivos de liquidações por data efetiva, deduzindo estornos na data da reversão.
- **Filtros por Contrato**: Cruzam títulos com a ponte `ContractRevenueReceivable` para expor Área Jurídica (`LegalArea`), Tipo de Receita (`RevenueType`) e Tipo de Atuação (`AssignmentType`).
- **Títulos Diretos**: Identificados pelo filtro "Sem vínculo com contrato" (ausência de ponte).
