# Domain Model

Este documento define o modelo de domínio canônico do sistema.
Toda arquitetura é estruturada em 4 Bounded Contexts estritamente desacoplados, além da fronteira multitenant e entidades transversais.

---

## 1. Contexto de Identidade e Perfis (Shared Kernel Global)

Identidade única e global para toda a empresa. Não possui escopo de `Firm`.

- `Person`: Entidade mestre de cadastro. Identifica qualquer indivíduo ou pessoa jurídica.
  - Campos: `id`, `fullName`, `document` (CPF/CNPJ único, nulo apenas para genéricos), `email`, `phone`, `isGeneric`, `seedKey`, `isActive`, `personTypeId`.
  - Pessoas genéricas (`isGeneric = true`) representam consolidações contábeis (ex: Pagamentos diversos, Recebimentos diversos) e dispensam documento fiscal.
  - Papéis comerciais (Cliente, Fornecedor, Colaborador) são **projeções da existência e atividade de perfis 1:1**, nunca colunas booleanas duplicadas.

- `ClientProfile`: Extensão 1:1 de `Person`.
  - Habilita a pessoa a atuar como cliente em contratos (`Contract.customerId`) e devedor em duplicatas a receber (`Receivable.debtorId`).

- `SupplierProfile`: Extensão 1:1 de `Person`.
  - Habilita a pessoa a atuar como fornecedora em despesas (`Expense.supplierId`) e beneficiária em duplicatas a pagar (`Payable.beneficiaryId`).

- `EmployeeProfile`: Extensão 1:1 de `Person`.
  - Concentra dados profissionais do colaborador: `employeeTypeId` (função no escritório), `oabNumber` (obrigatório apenas para Advogado), `remunerationPercentage`, `referralPercentage`.
  - **Invariante estrutural**: Um `EmployeeProfile` ativo exige atomicamente um `SupplierProfile` ativo da mesma `Person`. Todo colaborador que recebe remuneração é um fornecedor no pagar.

---

## 2. Contexto Operacional

Entidades de negócio da operação jurídica. Isoladas por `Firm`.

- `Firm`: Fronteira de tenant (filial ou unidade de negócio).
  - Configura parâmetros de régua: `remunerationCutoffDay` (padrão 25) e `remunerationDueDay` (padrão 5).
  - Títulos, contratos, despesas e movimentações financeiras pertencem a uma única `Firm`.

- `Contract`: Contrato de prestação de serviços jurídicos.
  - Vinculado a uma `Firm` e a um cliente (`ClientProfile`).
  - Possui `processNumber` único por filial, `legalAreaId`, `statusId`, `feePercentage` e notas.
  - Agrega equipe (`ContractAssignment`) e planos de receita (`Revenue`).

- `ContractAssignment`: Vínculo de membro da equipe a um contrato.
  - Conecta `Contract` a `EmployeeProfile` com uma função de atuação (`assignmentTypeId`).
  - Base para cálculo de comissões futuras.

- `Revenue`: Plano de receita acordado no contrato.
  - Pertence a um `Contract`. Possui `revenueTypeId`, valor negociado (`negotiatedAmount`) e observações.
  - Origem para geração de duplicatas a receber.

- `Expense`: Obrigação de custo operacional do escritório.
  - Pertence a uma `Firm` e a um fornecedor (`SupplierProfile`).
  - Possui valor negociado (`negotiatedAmount`), data prevista e observações.
  - Origem para geração de duplicatas a pagar.

---

## 3. Contexto de Pontes (Bridge Context / Camada Anticorrupção)

Tabelas de ligação dedicadas que conectam entidades operacionais a títulos financeiros.
Garantem que o financeiro permaneça 100% agnóstico e sem FKs operacionais.

- `ContractRevenueReceivable`: Ponte entre receita de contrato e duplicata a receber.
  - Campos: `id`, `firmId`, `contractId`, `revenueId`, `receivableId` (UNIQUE).
  - Garante que cada título a receber pertença a no máximo uma receita contratual.

- `ExpensePayable`: Ponte entre despesa operacional e duplicata a pagar.
  - Campos: `id`, `firmId`, `expenseId`, `payableId` (UNIQUE).
  - Garante que cada título a pagar pertença a no máximo uma despesa.

- `RemunerationPayable`: Ponte entre liquidação de cliente, regra de equipe e obrigação a pagar ao colaborador.
  - Campos: `id`, `firmId`, `receiptId`, `contractAssignmentId`, `payableId` (UNIQUE).
  - Armazena a memória de cálculo imutável: `calculationBase` (caixa líquido recebido), `effectivePercentage`, `calculatedAmount`, `computedDueDate` e `ruleSnapshot`.
  - O título a pagar gerado aponta para o `SupplierProfile` do colaborador.

---

## 4. Contexto Financeiro Puro (Agnóstico e Desacoplado)

Motor de contas a receber e a pagar independente.
Não possui colunas de contrato, despesa, geração ou código legado.

- `Receivable`: Duplicata a receber.
  - Pertence a uma `Firm`.
  - Devedor: `debtorId` referenciando `ClientProfile`.
  - Atributos: `amount`, `dueDate`, `analyticId`, `expectedPaymentMethodId`, `kind` (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), `notes`, `cancelledAt`.
  - **Zero colunas de origem operacional**. Se vier de contrato, a ponte `ContractRevenueReceivable` existe. Se for lançamento manual avulso, não possui ponte.

- `Payable`: Duplicata a pagar.
  - Pertence a uma `Firm`.
  - Beneficiário: `beneficiaryId` referenciando `SupplierProfile`.
  - Atributos: `amount`, `dueDate`, `analyticId`, `expectedPaymentMethodId`, `kind` (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), `notes`, `cancelledAt`.
  - **Zero colunas de origem operacional**. Se vier de despesa ou remuneração, as pontes `ExpensePayable` ou `RemunerationPayable` existem. Se for manual avulso, não possui ponte.

- `Receipt`: Liquidação real (baixa) de uma duplicata a receber.
  - Vinculado a exatamente um `Receivable`.
  - Campos: `effectiveDate` (hoje ou passado, nunca futura), `actualPaymentMethodId`, `principalAbated`, `discount`, `interest`, `penalty`, `effectiveAmount`, `generatesRemuneration`, `requestKey`, `actorId`.
  - Caixa efetivo: $C = P - D + J + M$.

- `Payment`: Liquidação real (baixa) de uma duplicata a pagar.
  - Vinculado a exatamente um `Payable`.
  - Campos: `effectiveDate`, `actualPaymentMethodId`, `principalAbated`, `discount`, `interest`, `penalty`, `effectiveAmount`, `requestKey`, `actorId`.
  - Caixa efetivo: $C = P - D + J + M$.

- `ReceiptReversal` / `PaymentReversal`: Estorno de liquidação.
  - Eventos de baixa são imutáveis; correções são estornos append-only (1:1 com o evento).
  - Campos: `receiptId` / `paymentId` (UNIQUE), `effectiveDate`, `reason`, `requestKey`, `actorId`.
  - Reverte saldo principal e fluxos de caixa na data do estorno.

---

## 5. Entidades Transversais

- `Attachment`: Arquivo ou comprovante vinculado a uma entidade do sistema.
  - Possui exatamente um dono exclusivo: `personId`, `contractId`, `expenseId`, `receivableId`, `payableId`, `receiptId`, `paymentId` ou `remunerationPayableId`.
  - Arquivos residem em storage privado.

- `AuditLog`: Trilha de auditoria imutável e transacional.
  - Registra: `firmId`, `actorId`, `entityType`, `entityId`, `action`, `changeData` (payload antes/depois), `createdAt`.
  - Gravado na mesma transação atômica das mutações financeiras e operacionais.

---

## 6. Regras de Saldos e Estados Derivados

- **Status do Título**:
  - `Pendente`: Nenhum abatimento de principal ($P = 0$) e dentro do vencimento.
  - `Em atraso`: Saldo em aberto e data de vencimento anterior à data atual.
  - `Parcial`: Saldo principal parcialmente abatido ($0 < P < Amount$).
  - `Quitado`: Saldo zerado (soma dos abatimentos de principal válida igual ao valor do título).
  - `Cancelado`: Título cancelado explicitamente sem nenhuma baixa ativa.
- **Títulos Manuais Diretos**: Identificados pela ausência de registros nas tabelas de ponte.
