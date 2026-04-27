## ADDED Requirements

### Requirement: Automated tests prioritize business-critical aggregate workflows
The test suite SHALL include direct Vitest coverage for the highest-risk business workflows where contractual behavior depends on aggregate writes, role-aware scope, lifecycle rules, or derived financial state.

#### Scenario: Contract aggregate write behavior is covered directly
- **WHEN** the contract feature changes create, update, delete, restore, lookup resolution, or aggregate mapping behavior
- **THEN** focused tests MUST exercise `src/features/contracts/data/mutations.ts` and `src/features/contracts/data/queries.ts`
- **AND** those tests MUST cover client eligibility, collaborator eligibility, lookup activity, status-lock rules, read-only states, aggregate sync behavior, delete blocking by active revenues, and derived revenue payment state

#### Scenario: Remuneration lifecycle and visibility behavior is covered directly
- **WHEN** the remuneration feature changes query, export, update, delete, or restore behavior
- **THEN** focused tests MUST exercise `src/features/remunerations/data/queries.ts` and `src/features/remunerations/data/mutations.ts`
- **AND** those tests MUST cover administrator versus regular-user scope, parent-fee deletion guards, manual override persistence, restore guards, and export scope parity with the on-screen list

#### Scenario: Dashboard financial aggregation is covered directly
- **WHEN** the dashboard feature changes summary aggregation, comparison windows, grouping totals, or recent-activity behavior
- **THEN** focused tests MUST exercise dashboard data-boundary behavior rather than filter parsing alone
- **AND** those tests MUST cover date-scoped down-payment inclusion, current-versus-previous comparisons, role-scoped summaries, grouped revenue totals, and recent-activity ordering

#### Scenario: Employee and audit query behavior is covered directly
- **WHEN** employee-management or audit-log query behavior changes
- **THEN** focused tests MUST exercise the owning query modules directly
- **AND** employee query tests MUST cover search filters, lookup filters, deterministic ordering, and active contract counts
- **AND** audit-log query tests MUST cover tenant scoping, filter translation, deterministic pagination, and distinct option generation
