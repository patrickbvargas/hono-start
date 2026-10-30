# Hono Documentation Index

Este diretório contém o contrato canônico do sistema Hono.
Todo o design reflete a **arquitetura desacoplada final**, estruturada em Bounded Contexts com tabelas de ponte e total separação entre o motor financeiro e as operações de negócio.

---

## 1. Estrutura do Contrato

O contrato divide-se em duas camadas:
1. `docs/domain/`: Regras de negócio, modelos conceituais, fluxos de telas e permissões.
2. `docs/implementation/`: Arquitetura técnica, stack fixo, padrões de frontend e banco de dados.

---

## 2. Ordem Canônica de Leitura

### Domínio do Sistema (`docs/domain/`)
1. [DOMAIN_MODEL.md](domain/DOMAIN_MODEL.md): Modelo canônico com 4 Bounded Contexts (Identidade, Operações, Pontes e Financeiro Puro).
2. [FINANCIAL_UML.md](domain/FINANCIAL_UML.md): Diagramas UML canônicos (Arquitetura de Contextos e Classes).
3. [FINANCIAL_SYSTEM.md](domain/FINANCIAL_SYSTEM.md): Contrato e regras do motor financeiro (títulos, pontes, baixas, equação de caixa, remunerações e estornos).
4. [USER_FLOWS.md](domain/USER_FLOWS.md): Fluxos de usuário ponta a ponta na interface.
5. [BUSINESS_RULES.md](domain/BUSINESS_RULES.md): Invariantes essenciais de negócio.
6. [ROLES_AND_PERMISSIONS.md](domain/ROLES_AND_PERMISSIONS.md): Matriz de controle de acesso baseada em Clerk (Admin vs Member).
7. [MULTITENANCY.md](domain/MULTITENANCY.md): Fronteira multitenant de filiais (`Firm`) e matriz de escopo.
8. [LOOKUP_VALUES.md](domain/LOOKUP_VALUES.md): Catálogos globais e tabelas físicas `ref_*`.

### Implementação Técnica (`docs/implementation/`)
9. [ARCHITECTURE.md](implementation/ARCHITECTURE.md): Stack fixo (TanStack Start/Router/Form/Query, Prisma, Tailwind) e Vertical Slices.
10. [DATA_ACCESS.md](implementation/DATA_ACCESS.md): Padrões de acesso a dados com Prisma e transações.
11. [FRONTEND.md](implementation/FRONTEND.md): Padrões de componentes e UI compartilhada.
12. [SECURITY.md](implementation/SECURITY.md): Autenticação Clerk e segurança de dados.
13. [ATTACHMENTS.md](implementation/ATTACHMENTS.md): Gestão de anexos e Supabase Storage privado.
14. [CONVENTIONS.md](implementation/CONVENTIONS.md): Convenções de código, linting e Biome.
15. [QUALITY_WORKFLOW.md](implementation/QUALITY_WORKFLOW.md): Gates de CI, testes e validação.

---

## 3. Resumo da Arquitetura Alvo

- **Identidade Unificada**: Rota única `/pessoas` gerencia `Person` com perfis 1:1 (`ClientProfile`, `SupplierProfile`, `EmployeeProfile`).
- **Operacional**: Contratos (`Contract`) com receitas (`Revenue`) e equipe (`ContractAssignment`); custos operacionais (`Expense`).
- **Pontes de Integração**: `ContractRevenueReceivable`, `ExpensePayable` e `RemunerationPayable` conectam operações a títulos sem sujar o financeiro.
- **Financeiro Puro**: `Receivable` e `Payable` são títulos monetários puros, sem nenhuma FK de origem operacional.
- **Liquidações e Caixa**: Baixas pontuais ou em seleção múltipla atômica (`Receipt` e `Payment`). Estornos append-only imutáveis.
- **Multitenancy**: `Firm` isola operações e finanças; Pessoas e catálogos são compartilhados na empresa.
