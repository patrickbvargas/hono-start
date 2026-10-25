# Glossary

## Domain Terms

- `Employee` / `Colaborador`: a lawyer or administrative assistant inside the firm.
- `Client` / `Cliente`: the represented person or company.
- `Contract` / `Contrato`: the legal engagement linked to a client.
- `Revenue` / `Receita`: a payment plan attached to a contract.
- `Fee` / `Recebimento`: a concrete payment installment received from the client. `Honorários` remains the broader contractual financial obligation and is retained in planned/received analytics labels.
- `Remuneration` / `Remuneracao`: the amount owed to an employee after a fee event.
- `Firm` / `Escritorio`: the tenant boundary in the application.

User-facing state terms: `Andamento` is contract lifecycle, `Situação` is active/inactive, and payment badges describe Pendente, Parcial, Quitado or Em atraso.

## Status Terms

- `active`: enabled business record; separate from whether it is soft-deleted.
- `inactive`: visible state toggle independent from deletion.
- `deleted`: soft-deleted record retained for restoration and audit.
- `writable`: a resource state in which the current attempted mutation is allowed by lifecycle rules, permission rules, and tenant scope.
- `read-only`: a resource state in which the attempted mutation must be blocked even if the actor can otherwise view the resource.

## Visibility And Scope Terms

- `scoped`: limited by authenticated role, tenant, and resource visibility rules rather than firm-wide by default.
- `role-scoped`: visible or actionable according to the current user's role.
- `firm-scoped`: visible or actionable across the current firm only, never across firms.
- `assignment-scoped`: visible or actionable only when the current actor is assigned to the relevant contract context.
- `allowed contract boundaries`: the actor is in the same firm, satisfies assignment-based visibility where required, and the target contract-side resource is still writable for the attempted action.
- `own financial visibility`: a regular user can see only remuneration and dashboard financial data tied to that user's own employee identity unless another rule explicitly expands scope.
- `cash flow`: read-only dashboard aggregation where `entrada` means received honorários, `saída` means recorded `despesas`, and `saldo` means `entrada - saída`.

## Documentation Terms

- `domain docs`: reusable business truth.
- `implementation docs`: repo-specific technical contract.
- `implementation contract`: the full set of rules that constrain how this repository must be built.
- `lookup value`: stable business code such as `LAWYER` or `SOCIAL_SECURITY` that identifies a domain option independent from database ID.
- `canonical`: the file or rule that is the authoritative source when overlapping summaries exist elsewhere.
