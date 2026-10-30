# Roles And Permissions

Este documento define a matriz de autorização e controle de acesso baseada em Clerk.

---

## 1. Autoridade de Acesso (Clerk)

- A autenticação, organizações, papéis e permissões são gerenciados exclusivamente pelo **Clerk**.
- O token da sessão vincula o usuário autenticado a:
  - Uma `Person` ativa (com `EmployeeProfile` ativo associado).
  - Uma `Firm` ativa (selecionada pelo `Organization.privateMetadata.firmId`).
- Sem vínculo válido com `Person` e `Firm`, o acesso aos recursos de negócio é bloqueado.

---

## 2. Papéis Canônicos em Produção

1. **`Admin` (Administrador)**:
   - Gestão operacional e financeira completa dentro da sua `Firm`.
   - Gerencia colaboradores, fornecedores, clientes, contratos, despesas, títulos a pagar e a receber.
   - Acesso irrestrito a relatórios, histórico de auditoria e exclusões/restaurações lógicas.
2. **`Member` (Membro / Advogado / Assistente)**:
   - Acesso estritamente restrito aos contratos onde está incluído na equipe (`ContractAssignment`).
   - Visualiza apenas clientes dos seus contratos atribuídos.
   - **Sigilo Absoluto**: Vê apenas os seus próprios títulos de remuneração. Não acessa despesas da firma, fornecedores, títulos diretos nem remunerações de outros colaboradores.

---

## 3. Matriz de Permissões por Recurso

| Módulo / Funcionalidade | Papel `Admin` | Papel `Member` |
|---|---|---|
| **Pessoas (`/pessoas`) — Clientes** | Ver, Criar, Editar, Excluir | Ver apenas clientes de seus contratos; Criar |
| **Pessoas (`/pessoas`) — Fornecedores** | Total | Sem acesso |
| **Pessoas (`/pessoas`) — Colaboradores (Dados Profissionais e %)** | Total | Sem acesso (vê apenas membros na equipe do contrato) |
| **Contratos (`/contratos`)** | Todos da filial | Apenas contratos onde participa da equipe |
| **Criar e Editar Contratos** | Sim | Sim (dentro das regras de equipe) |
| **Acerto Financeiro de Contratos** | Sim | Sim (se tiver permissão operacional no contrato) |
| **Despesas (`/despesas`)** | Total | Sem acesso |
| **Contas a Receber (`/contas-a-receber`)** | Total | Apenas duplicatas dos seus contratos atribuídos |
| **Registrar Recebimento (Baixa)** | Sim | Sim (quando autorizado em contratos atribuídos) |
| **Contas a Pagar (`/contas-a-pagar`)** | Total | Apenas duplicatas da **sua própria remuneração** |
| **Registrar Pagamento** | Sim | Sem acesso |
| **Estornar Recebimento / Pagamento** | Sim | Sem acesso |
| **Lançamentos Manuais Diretos** | Sim | Sem acesso |
| **Fluxo de Caixa e Relatórios Globais** | Sim | Sem acesso |
| **Exclusão Lógica e Restauração** | Sim | Sem acesso |
| **Auditoria (`AuditLog`)** | Total da filial | Apenas eventos de entidades acessíveis |

---

## 4. Regras Estritas de Visibilidade e Sigilo

1. **Vedação de Descoberta Indireta**:
   - Um `Member` nunca poderá inferir a remuneração de terceiros por contagens de títulos, totais somados em dashboards, exportações em lote ou opções em selects.
   - Filtros por `AssignmentType` ou `Employee` são filtrados no servidor antes de calcular paginações e totais.
2. **Escopo por Filial (`Firm`)**:
   - Nenhuma permissão ultrapassa a fronteira da filial ativa. Trocar de filial no seletor de organização do Clerk atualiza instantaneamente todo o escopo de leitura e escrita.
