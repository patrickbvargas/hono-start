# Business Rules

Este documento reúne as invariantes e regras de negócio canônicas do sistema.

---

## 1. Identidade e Perfis (`Person`)

1. **CPF/CNPJ Obrigatório e Único**:
   - Todo cadastro comum de `Person` exige documento fiscal brasileiro válido e formatado (CPF ou CNPJ).
   - O documento é único em toda a empresa.
2. **Exceção de Documento Nulo (Genéricos)**:
   - Somente pessoas marcadas com `isGeneric = true` (ex: Pagamentos diversos, Recebimentos diversos) podem ter `document = NULL` e `personTypeId = NULL`.
   - Pessoas genéricas não podem ter `EmployeeProfile` nem vínculo de login/usuário.
3. **Papéis Comerciais como Projeções**:
   - Os papéis Cliente, Fornecedor e Colaborador derivam da existência e atividade de `ClientProfile`, `SupplierProfile` e `EmployeeProfile`. Não são flags booleanas soltas no banco.
4. **Colaborador Implica Fornecedor**:
   - Criar ou ativar `EmployeeProfile` exige atomicamente `SupplierProfile` ativo da mesma `Person`.
   - O papel Fornecedor não pode ser removido enquanto o Colaborador estiver ativo.
5. **Advogado Exige OAB**:
   - Se `EmployeeProfile.employeeTypeId == LAWYER`, o número da OAB é obrigatório e único por estado.

---

## 2. Contratos e Operações

1. **Número de Processo Único por Filial**:
   - O `processNumber` do contrato é estritamente único dentro da mesma `Firm`.
2. **Composição Mínima de Contrato**:
   - Todo contrato exige pelo menos 1 cliente (`ClientProfile`), 1 colaborador responsável (`ContractAssignment`) e 1 plano de receita (`Revenue`).
3. **Limite de Receitas por Tipo**:
   - Um contrato pode ter no máximo uma receita ativa por modalidade (`ADMINISTRATIVE`, `JUDICIAL`, `SUCCUMBENCY`).
4. **Equipe e Percentuais**:
   - O percentual de indicação (`referralPercentage`) não pode ser superior ao percentual de remuneração (`remunerationPercentage`) do colaborador.
5. **Independência Operacional vs Financeira**:
   - Concluir ou cancelar um contrato ou despesa **não apaga nem cancela dívidas financeiras**.
   - Títulos gerados continuam válidos e liquidáveis normalmente.

---

## 3. Acerto Financeiro e Pontes de Fronteira

1. **Trava de Fechamento do Acerto**:
   - Ao confirmar o acerto financeiro de uma `Revenue` ou `Expense`, a soma de todos os títulos previstos (incluindo entrada) **deve igualar o valor acordado exatamente em centavos**.
   - Diferença maior ou menor que zero bloqueia a confirmação.
2. **Ponte Única por Título**:
   - Um título a receber pertence a no máximo uma receita: `receivableId` é `UNIQUE` na tabela `contract_revenue_receivables`.
   - Um título a pagar pertence a no máximo uma despesa: `payableId` é `UNIQUE` na tabela `expense_payables`.
3. **Títulos Diretos**:
   - Duplicatas manuais não possuem registro em pontes. Devem possuir obrigatoriamente `notes` com justificativa e registro em `audit_logs`.

---

## 4. Liquidações e Equação do Caixa

1. **Equação do Caixa Efetivo**:
   $$C = P - D + J + M$$
   - Principal abatido $P > 0$ e $P \le \text{saldo devedor}$.
   - Desconto $0 \le D \le P$.
   - Juros $J \ge 0$ e Multa $M \ge 0$.
   - Caixa efetivo $C \ge 0$ (nunca negativo).
2. **Proibição de Data Futura**:
   - Liquidações (`Receipt` e `Payment`) e estornos aceitam data de hoje ou data passada, **nunca data futura**.
3. **Imutabilidade e Estorno**:
   - Liquidações confirmadas não podem ser editadas ou excluídas.
   - Toda correção exige estorno append-only (`ReceiptReversal` ou `PaymentReversal`) com justificativa obrigatória.

---

## 5. Regras de Remuneração da Equipe

1. **Evento Gerador**:
   - Apenas baixas confirmadas de duplicatas contratuais com flag `generatesRemuneration = true` geram obrigações de remuneração.
   - Títulos manuais ou despesas operacionais nunca geram remuneração.
2. **Base de Cálculo**:
   - A comissão incide sobre o **caixa efetivo real** $C$ da baixa, após descontos e incluindo acréscimos manuais.
3. **Régua de Vencimento**:
   - Baixa com data efetiva até o dia configurado em `Firm.remunerationCutoffDay` (padrão 25): vence no dia `Firm.remunerationDueDay` (padrão 5) do mês seguinte.
   - Baixa após o dia de corte: vence no segundo mês subsequente.
4. **Trava de Estorno em Cascata**:
   - É proibido estornar um `Receipt` se qualquer um dos títulos `Payable` de remuneração gerados por ele já tiver sido pago.
   - É obrigatório estornar primeiro os pagamentos da equipe antes de reverter o recebimento do cliente.

---

## 6. Multitenancy e Permissões

1. **Isolamento por Filial**:
   - `Firm` é a fronteira de dados operacionais e financeiros. É proibido qualquer cruzamento de dados entre filiais distintas.
2. **Sigilo Absoluto de Remuneração para `Member`**:
   - Um usuário com papel `Member` **nunca** tem acesso a valores, totais, relatórios ou duplicatas de remuneração de outros colaboradores.
   - `Member` visualiza apenas clientes de contratos aos quais está expressamente atribuído na equipe.
