## Why

As listas principais dependem de filtros URL-driven, mas hoje falta um atalho explícito para voltar ao estado padrão sem limpar campo por campo. Adicionar uma ação de limpar filtros reduz atrito operacional nas rotas mais usadas e preserva o comportamento compartilhável já definido pelo contrato.

## What Changes

- Add a clear-filters action to each entity list filter surface: clients, employees, contracts, fees, remunerations, and audit logs.
- Reset inline search and advanced-popover filters back to each route's validated default filter state.
- Preserve non-filter route state such as current sorting while resetting pagination back to the first page.
- Reuse the shared filter orchestration instead of introducing route-local reset logic.
- Add focused tests for shared filter reset behavior and list filter UI integration.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `client-management`: client list gains an explicit action to clear search and advanced filters.
- `employee-filter-ui`: employee filter UI gains an explicit action to clear search and advanced filters.
- `contract-management`: contracts list gains an explicit action to clear search and advanced filters.
- `fee-management`: fees list gains an explicit action to clear search and advanced filters.
- `remuneration-management`: remunerations list gains an explicit action to clear search and advanced filters.
- `audit-log-management`: audit-log list gains an explicit action to clear search and advanced filters.

## Impact

- Affected code: `src/shared/hooks/use-filter.ts`, `src/shared/components/filter-popover.tsx`, feature filter hooks and filter components under `src/features/clients`, `employees`, `contracts`, `fees`, `remunerations`, and `audit-logs`.
- APIs: no backend or database contract changes; URL search state remains authoritative.
- Multi-tenant and roles: no scope changes; reset only changes client-side route search values already validated per route.
- Dependencies: no new package expected.

## Non-goals

- Do not change supported filter fields, sorting defaults, or pagination defaults.
- Do not add reset actions to non-entity screens such as dashboard.
- Do not redesign the current popover/filter layout beyond the clear action needed for list workflows.
