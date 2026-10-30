# Lookup Values

Este documento define os catálogos canônicos globais do sistema.
Todas as tabelas físicas utilizam o prefixo `ref_` e possuem as colunas `id`, `value`, `label` e `isActive`.

---

## 1. Mapeamento Físico de Tabelas

| Prisma Model | Tabela Física | Finalidade |
|---|---|---|
| `PersonType` | `ref_person_types` | Classificação fiscal da pessoa |
| `EmployeeType` | `ref_employee_types` | Função profissional do colaborador |
| `LegalArea` | `ref_legal_areas` | Área jurídica do contrato |
| `ContractStatus` | `ref_contract_statuses` | Situação do contrato |
| `AssignmentType` | `ref_assignment_types` | Papel do colaborador na equipe do contrato |
| `RevenueType` | `ref_revenue_types` | Modalidade da receita do contrato |
| `FinancialAnalytic` | `ref_financial_analytics` | Classificação contábil do título financeiro |
| `PaymentMethod` | `ref_payment_methods` | Meio de pagamento previsto e efetivo |
| `AttachmentType` | `ref_attachment_types` | Categoria do arquivo anexo |

> **Nota sobre Classificação de Títulos**: A classificação de duplicatas é um enum nativo na coluna `kind` (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), não utilizando tabela de lookup.

---

## 2. Valores Canônicos dos Catálogos

### Tipos de Pessoa (`ref_person_types`)
| Value | Label |
|---|---|
| `INDIVIDUAL` | Pessoa Física |
| `COMPANY` | Pessoa Jurídica |

### Funções de Colaborador (`ref_employee_types`)
| Value | Label | Observação |
|---|---|---|
| `LAWYER` | Advogado | Exige número de OAB |
| `ADMIN_ASSISTANT` | Auxiliar Administrativo | Suporte administrativo |
| `INTERN` | Estagiário | Apoio jurídico ou administrativo |
| `COORDINATOR` | Coordenador | Coordenação de equipe |
| `MANAGER` | Gerente | Gestão operacional |
| `ACCOUNTANT` | Contador | Contabilidade |
| `LEGAL_ASSISTANT` | Assistente Jurídico | Apoio jurídico |
| `OTHER` | Outro | Outras funções corporativas |

### Áreas Jurídicas (`ref_legal_areas`)
| Value | Label |
|---|---|
| `SOCIAL_SECURITY` | Previdenciário |
| `CIVIL` | Cível |
| `FAMILY` | Família |
| `LABOR` | Trabalhista |
| `OTHER` | Outros |

### Situações de Contrato (`ref_contract_statuses`)
| Value | Label |
|---|---|
| `ACTIVE` | Ativo |
| `COMPLETED` | Concluído |
| `CANCELLED` | Cancelado |

### Tipos de Atuação na Equipe (`ref_assignment_types`)
| Value | Label |
|---|---|
| `RESPONSIBLE` | Responsável |
| `RECOMMENDING` | Indicante |
| `RECOMMENDED` | Indicado |
| `ADMIN_ASSISTANT` | Assistente Administrativo |

### Tipos de Receita (`ref_revenue_types`)
| Value | Label |
|---|---|
| `ADMINISTRATIVE` | Administrativo |
| `JUDICIAL` | Judicial |
| `SUCCUMBENCY` | Sucumbência |

### Meios de Pagamento (`ref_payment_methods`)
| Value | Label |
|---|---|
| `PIX` | Pix |
| `BANK_TRANSFER` | Transferência Bancária |
| `BOLETO` | Boleto |
| `CREDIT_CARD` | Cartão de Crédito |
| `CASH` | Dinheiro |
| `CHECK` | Cheque |

### Categorias de Anexo (`ref_attachment_types`)
| Value | Label |
|---|---|
| `CONTRACT` | Contrato |
| `DOCUMENT` | Documento de Identificação |
| `RECEIPT` | Comprovante de Recebimento |
| `OUTFLOW_PROOF` | Comprovante de Pagamento |
