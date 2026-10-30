# Lookup Values

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Target PersonType evolves ClientType; FinancialAnalytic evolves global ExpenseCategory, preserving stable values. Add global PaymentMethod and TitleKind. All catalogs have no Firm FK. LAWYER uses PAYROLL_LAWYERS; ADMIN_ASSISTANT uses PAYROLL_STAFF. Status/quitada are derived. Local UserRole is not target account authority.


This file defines the canonical lookup catalogs used by the product domain.

Lookup values are domain truth:

- `value` is the stable application identity
- `label` is the pt-BR display value
- inactive lookup values may remain visible but disabled in selection UIs
- lookup values are immutable through the product UI
- lookup values are global rather than firm-scoped

## Physical database naming

All global catalog tables use the `ref_` prefix, with `id`, `value`, `label` and `isActive`. Prisma model names remain unchanged through `@@map`. TitleKind follows the same table pattern; it is not an enum.

| Prisma model | Physical table |
|---|---|
| PersonType | ref_person_types |
| EmployeeType | ref_employee_types |
| LegalArea | ref_legal_areas |
| ContractStatus | ref_contract_statuses |
| AssignmentType | ref_assignment_types |
| RevenueType | ref_revenue_types |
| AttachmentType | ref_attachment_types |
| FinancialAnalytic | ref_financial_analytics |
| PaymentMethod | ref_payment_methods |
| TitleKind | ref_title_kinds |

Rename migrations preserve rows, IDs, FK relationships, RLS and grants. Raw SQL in seeds and verification scripts must use physical names. Historical migration files retain their original names and checksums; never edit applied migrations to retrofit the prefix.

## Employee Types

| Value | Label |
|---|---|
| `LAWYER` | Advogado |
| `ADMIN_ASSISTANT` | Assistente Administrativo |

## User Roles

| Value | Label |
|---|---|
| `ADMIN` | Administrador |
| `USER` | Usuário |

## Client Types

| Value | Label |
|---|---|
| `INDIVIDUAL` | Pessoa Física |
| `COMPANY` | Pessoa Jurídica |

## Legal Areas

| Value | Label |
|---|---|
| `SOCIAL_SECURITY` | Previdenciário |
| `CIVIL` | Cível |
| `FAMILY` | Família |
| `LABOR` | Trabalhista |
| `OTHER` | Outros |

## Contract Statuses

| Value | Label |
|---|---|
| `ACTIVE` | Ativo |
| `COMPLETED` | Concluído |
| `CANCELLED` | Cancelado |

## Revenue Types

| Value | Label |
|---|---|
| `ADMINISTRATIVE` | Administrativo |
| `JUDICIAL` | Judicial |
| `SUCCUMBENCY` | Sucumbência |

## Assignment Types

| Value | Label |
|---|---|
| `RESPONSIBLE` | Responsável |
| `RECOMMENDING` | Indicante |
| `RECOMMENDED` | Indicado |
| `ADMIN_ASSISTANT` | Assistente Administrativo |

## Attachment Types

| Value | Label |
|---|---|
| `PDF` | PDF |
| `JPG` | JPG |
| `PNG` | PNG |

## Expense Categories

| Value | Label |
|---|---|
| `PAYROLL_LAWYERS` | Folha Advogados |
| `PAYROLL_INTERNS` | Folha Estagiários |
| `PAYROLL_STAFF` | Folha Funcionários |
| `TAX_PIS` | PIS |
| `TAX_IRPJ` | IRPJ |
| `TAX_COFINS` | COFINS |
| `TAX_ISSQN` | ISSQN |
| `TAX_CSLL` | CSLL |
| `TAX_OTHER` | Outros Impostos |
| `PHONE` | Telefone |
| `MEDIA` | Mídia |
| `POSTAGE` | Correio |
| `CONDOMINIUM` | Condomínio |
| `ELECTRICITY` | RGE |
| `MEALS` | Refeitório |
| `ASSETS` | Patrimônio |
| `SUPPLIES` | Insumos |
| `NOTARY` | Tabelionato |
| `COURT_COSTS` | Custos Judiciais |
| `OTHER` | Outros |

## Legacy user roles

The local UserRole lookup remains for historical compatibility during migration. It is not selectable authority for accounts. Current roles and grants are configured in Clerk; employee business forms do not assign access.
