# User Flows — Canonical Workflows

Este documento descreve os fluxos de usuário canônicos do sistema.

---

## 1. Cadastro e Gestão de Pessoas (`/pessoas`)

1. O usuário acessa a listagem unificada em **Cadastros → Pessoas**.
2. Abre o formulário de nova pessoa ou edição.
3. Informa nome, documento (CPF/CNPJ) e contatos.
4. Seleciona os papéis aplicáveis através dos checkboxes:
   - **Cliente**: Cria/ativa o `ClientProfile`. Habilita a pessoa para contratos e recebimentos.
   - **Fornecedor**: Cria/ativa o `SupplierProfile`. Habilita a pessoa para despesas e pagamentos.
   - **Colaborador**: Cria/ativa o `EmployeeProfile`. Exige função (`EmployeeType`), OAB (obrigatória para advogados) e percentuais de comissão.
   - *Regra*: Marcar **Colaborador** marca automaticamente **Fornecedor** e impede sua remoção enquanto o colaborador estiver ativo.
5. Salva o formulário. O sistema cria/atualiza a `Person` e os perfis numa única transação atômica.
6. Acesso por perfil: Usuário `Member` só visualiza clientes com contratos atribuídos a ele. Não tem acesso a colaboradores nem fornecedores.

---

## 2. Contratos e Planos de Receita (`/contratos`)

1. O usuário acessa a listagem de **Contratos** e clica em novo contrato.
2. Seleciona o cliente (filtrado por pessoas com `ClientProfile` ativo).
3. Informa número do processo, área jurídica, percentual de honorários contratuais e observações.
4. Adiciona a equipe do contrato (`ContractAssignment`):
   - Seleciona colaboradores com `EmployeeProfile` ativo.
   - Define o tipo de atuação (ex: Responsável, Indicante, Indicado).
5. Adiciona os planos de receita (`Revenue`):
   - Informa tipo de receita (Administrativo, Judicial, Sucumbência) e valor negociado.
6. Salva o contrato com sua equipe e receitas.

---

## 3. Acerto Financeiro de Contrato (Geração de Títulos)

1. No detalhe do contrato ou da receita, o operador solicita o **Acerto Financeiro**.
2. O sistema herda o valor acordado da `Revenue`.
3. O operador informa:
   - Valor de entrada (opcional) e seu vencimento.
   - Quantidade de parcelas e primeiro vencimento das parcelas.
   - Analítica contábil e forma esperada de pagamento.
4. O sistema gera uma prévia editável na tela.
5. O operador pode ajustar valores e vencimentos individuais na prévia.
6. **Validação**: A soma exata de todos os títulos da prévia deve igualar o valor negociado em centavos.
7. O operador confirma. O sistema grava atomicamente:
   - Os títulos na tabela `receivables` (devedor = cliente do contrato).
   - Os vínculos na tabela de ponte `contract_revenue_receivables`.
   - O registro imutável no `audit_logs`.

---

## 4. Despesas Operacionais (`/despesas`)

1. O operador financeiro acessa **Despesas** e inicia o cadastro.
2. Seleciona o fornecedor (`SupplierProfile` ativo), informa valor negociado, data prevista e observações.
3. Ao confirmar o parcelamento da despesa:
   - O sistema valida a soma dos títulos com o valor da despesa.
   - Grava os títulos na tabela `payables` (beneficiário = fornecedor).
   - Grava os vínculos na tabela de ponte `expense_payables`.

---

## 5. Lançamentos Manuais Diretos no Financeiro

1. O operador acessa a tela de **Contas a Receber** ou **Contas a Pagar**.
2. Clica em **Novo Título Manual**:
   - Informa contraparte (`ClientProfile` no receber ou `SupplierProfile` no pagar).
   - Informa valor, vencimento, analítica, meio de pagamento previsto e justificativa (`notes`).
3. Ao salvar, o sistema grava o título diretamente em `receivables` ou `payables` sem criar registros em nenhuma tabela de ponte.

---

## 6. Baixa de Recebível e Motor de Remuneração

1. O operador acessa **Contas a Receber** e seleciona 1 ou mais títulos da mesma filial.
2. Clica em **Registrar Recebimento**:
   - Informa data efetiva (hoje ou passada) e meio de pagamento real.
   - Define principal abatido $P$, desconto $D$, juros $J$ e multa $M$.
   - Marca se deseja **Gerar Remunerações** (habilitado por padrão em títulos contratuais).
3. Ao confirmar:
   - O sistema grava um `Receipt` para cada título selecionado.
   - Abate o saldo devedor do `Receivable`.
   - Se for título de contrato e remuneração ativa: avalia a equipe em `ContractAssignment`, calcula o percentual sobre o caixa efetivo $C = P - D + J + M$, calcula o vencimento pela régua da filial, grava a ponte `remuneration_payables` e gera a duplicata `Payable` para o colaborador.

---

## 7. Baixa de Pagável (Pagamento de Fornecedor / Colaborador)

1. O operador acessa **Contas a Pagar** e seleciona os títulos que deseja quitar (inclusive remunerações da equipe).
2. Clica em **Registrar Pagamento**:
   - Informa data efetiva e meio de pagamento real.
   - Define principal abatido, descontos e encargos.
3. Ao confirmar, o sistema grava um `Payment` para cada título selecionado e abate seus saldos.

---

## 8. Estorno de Liquidação (Reversão)

1. O operador abre o detalhe da baixa que deseja cancelar e clica em **Estornar**.
2. Informa o motivo obrigatório do estorno.
3. O sistema valida dependências:
   - Se for baixa a receber que gerou remunerações e alguma delas já foi paga: **bloqueia o estorno**.
   - Se nenhuma remuneração foi paga: cancela os títulos de remuneração gerados, grava o `ReceiptReversal` ou `PaymentReversal` e reabre o saldo do título original.
