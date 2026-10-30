# Multitenancy — Arquitetura de Filiais

Este documento define a fronteira multitenant do sistema: uma única empresa jurídica com múltiplas filiais operacionais (`Firm`).

---

## 1. Matriz de Escopo de Entidades

| Entidade / Recurso | Escopo | Presença de `firmId` | Regra de Acesso |
|---|---|---|---|
| `Firm` | Unidade / Filial | Identificador próprio | Selecionada via `Organization.privateMetadata.firmId` no Clerk |
| `Person` | Global (Toda a empresa) | Ausente | Compartilhada entre todas as filiais |
| `ClientProfile` | Global | Ausente | Papel de cliente disponível para contratos em qualquer filial |
| `SupplierProfile` | Global | Ausente | Papel de fornecedor disponível para despesas/pagamentos em qualquer filial |
| `EmployeeProfile` | Global | Ausente | Dados profissionais e percentuais válidos em qualquer filial |
| Catálogos (`ref_*`) | Global | Ausente | Valores padronizados da empresa |
| `Contract` | Filial (`Firm`) | Obrigatório | Isolado na filial onde foi firmado |
| `ContractAssignment` | Filial (`Firm`) | Obrigatório | Equipe local do contrato |
| `Revenue` | Filial (`Firm`) | Obrigatório | Plano de receita do contrato |
| `Expense` | Filial (`Firm`) | Obrigatório | Custo operacional da filial |
| `ContractRevenueReceivable` | Filial (`Firm`) | Obrigatório | Ponte operacional-financeira local |
| `ExpensePayable` | Filial (`Firm`) | Obrigatório | Ponte operacional-financeira local |
| `RemunerationPayable` | Filial (`Firm`) | Obrigatório | Ponte de remuneração local |
| `Receivable` | Filial (`Firm`) | Obrigatório | Duplicata a receber local |
| `Payable` | Filial (`Firm`) | Obrigatório | Duplicata a pagar local |
| `Receipt` / `Payment` | Filial (`Firm`) | Obrigatório | Movimentação financeira e caixa local |
| Reversões (`ReceiptReversal`, `PaymentReversal`) | Filial (`Firm`) | Obrigatório | Estorno local |
| `Attachment` | Dono | Obrigatório (origem) | Arquivos operacionais seguem a filial do dono; arquivos de pessoa são globais |
| `AuditLog` | Contexto auditado | Obrigatório | Registra a filial onde o evento ocorreu |

---

## 2. Princípios de Isolamento Operacional

1. **Compartilhamento de Identidade**:
   - Cadastrar ou editar uma `Person` na Matriz reflete instantaneamente em todas as filiais.
   - O CPF/CNPJ é único para toda a empresa.
2. **Isolamento Estrito de Operações e Finanças**:
   - Uma duplicata, contrato ou despesa pertence a **exatamente uma filial**.
   - É proibido criar títulos ou liquidações com relacionamento cruzado entre filiais distintas.
   - Contratos de uma filial não são visíveis em outra, mesmo para o mesmo cliente global.
   - Número do processo (`processNumber`) é único por filial (o mesmo número pode existir em filiais diferentes se forem instâncias distintas).
3. **Comutação de Filial no Clerk**:
   - O seletor de organização do Clerk atualiza a filial ativa (`firmId`).
   - Ao trocar de filial, o frontend limpa o cache do TanStack Query e recarrega os dados sob o novo contexto de filial.
