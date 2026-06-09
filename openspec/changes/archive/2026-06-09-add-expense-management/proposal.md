## Why

O produto já controla entradas por meio de `Honorários`, mas ainda não possui uma superfície equivalente para registrar saídas operacionais. Sem `Despesas`, o sistema não consegue representar o outro lado do fluxo financeiro da firma, o que mantém o controle de caixa incompleto e força esse acompanhamento a continuar fora da aplicação.

## What Changes

- Add a new `expense-management` capability for firm-scoped expense listing, detail viewing, create, update, soft-delete, restore, and attachment-aware workflows.
- Introduce a standalone authenticated `/despesas` route that follows the same thin-route and overlay composition pattern already used by `clientes` and `honorarios`.
- Materialize a first-class `Expense` entity with category, expense date, amount, optional notes, active state, soft-delete lifecycle, tenant scoping, and audit coverage.
- Add a seeded and stable expense-category catalog for the business categories provided by the firm so the UI binds categories by stable application values instead of ad hoc labels.
- Extend attachment management so expense details can expose an `Anexos` section inside the details drawer without leaving the list workflow.
- Define the first expense list contract explicitly: query by notes, category filter, expense-date range, active filter, deleted-state filter, default sort by expense date descending, and lifecycle chips/clear-filter behavior aligned with the current entity routes.
- Update the canonical domain and implementation docs in `docs/` so a future contributor can discover the new route, entity, permissions, lookup family, and feature behavior without reverse-engineering the change history.

## Non-goals

- Building cash-flow analytics, dashboard widgets, or net-balance calculations in the same change.
- Linking expenses to contracts, clients, revenues, or remunerations in the first version.
- Creating a standalone global attachments workspace for expenses outside the existing details-drawer pattern.
- Redesigning the established entity-management architecture instead of reusing the current slice pattern.

## Capabilities

### New Capabilities
- `expense-management`: Expense persistence, `/despesas` route, list and overlay workflows, category catalog, validation, lifecycle actions, and role-aware access.

### Modified Capabilities
- `attachment-management`: extend supported attachment owner contexts so expense details can list, upload, and delete attachments through the shared attachment section.
- `lookup-reference-data`: extend seeded stable lookup catalogs so expense categories are resolved by stable values and surfaced consistently in forms and filters.

## Impact

- Affected code: Prisma schema and seed data, `src/features/expenses/**`, `src/routes/_app/despesas.tsx`, shared route config and navigation, shared session authorization wiring, and the attachments feature to support expense owner context.
- Affected docs: new `expense-management` spec plus attachment and lookup-reference spec deltas, followed by canonical `docs/domain/*` and `docs/implementation/*` updates when implementation lands.
- Affected roles: proposal assumes administrators have firm-wide expense visibility and write access because expenses are firm-wide outflow data and do not inherit contract-scoped visibility.
- Multi-tenancy: every expense read, write, filter, category resolution, and attachment operation remains strictly scoped to the authenticated user's `firmId`.
