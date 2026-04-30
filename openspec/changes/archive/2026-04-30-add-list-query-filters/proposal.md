## Why

As listas de contratos, honorários, remunerações e auditoria ainda exigem combinação de filtros estruturados para localizar registros que os usuários normalmente procuram por texto livre. Isso cria fricção frente ao padrão já existente em colaboradores e clientes, onde a busca textual reduz o tempo para encontrar registros operacionais frequentes.

## What Changes

- Add free-text `query` filters to the contracts, fees, remunerations, and audit-log list routes.
- Make each route persist the new query state in the URL using the same server-driven list pattern already used by employees and clients.
- Apply the query filter on the server with tenant-safe and role-aware scoping preserved for each feature.
- Add focused tests covering query parsing and query-to-database filter translation for the affected features.

## Capabilities

### New Capabilities
- `audit-log-management`: define audit-log list query behavior for free-text matching by acting user name or record name

### Modified Capabilities
- `contract-management`: contract list supports free-text query by process number or client name
- `fee-management`: fee list supports free-text query by parent contract number
- `remuneration-management`: remuneration list supports free-text query by parent contract number or collaborator name

## Impact

- Affected code: `src/features/contracts`, `src/features/fees`, `src/features/remunerations`, `src/features/audit-logs`, route search schemas, and list filter UI components
- Affected docs: OpenSpec specs for the modified capabilities and project query behavior contract
- User roles: administrators and regular authenticated users benefit from faster list lookup without changing existing visibility scope
- Multi-tenant impact: none to tenant boundaries; all queries remain scoped by authenticated firm and existing role rules

## Non-goals

- No changes to sorting, pagination, or existing structured filters
- No fuzzy ranking, highlighted matches, or cross-feature global search
- No changes to create, edit, delete, restore, or export flows beyond preserving the new query state
