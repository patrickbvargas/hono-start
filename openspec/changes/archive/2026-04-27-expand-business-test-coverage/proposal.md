## Why

Current Vitest suite covers many guardrails and several feature slices well, but it still leaves business-critical gaps in direct data-boundary coverage for contracts, remunerations, dashboard aggregation, employee queries, and audit-log queries. Those gaps leave core legal-fee and remuneration behavior under-protected even though the project contract treats them as central product truth.

## What Changes

- Expand the automated test contract to require direct business-behavior coverage for the highest-risk feature slices.
- Define explicit coverage expectations for contract aggregate writes, remuneration visibility and lifecycle behavior, dashboard financial aggregation, employee query behavior, and audit-log query behavior.
- Keep the work focused on Vitest coverage and test infrastructure patterns already used in the repository.

## Non-goals

- No user-facing product behavior changes.
- No architecture rewrite, framework swap, or test-runner replacement.
- No blanket line-coverage target disconnected from documented business risk.
- No migration of every existing test file unless needed to support the new coverage contract.
- No auth-feature proposal or auth-flow implementation work in this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contract-aligned-test-suite`: strengthen the test-suite contract for business-critical workflows and high-risk data-boundary behavior.

## Impact

- Affected specs: `openspec/specs/contract-aligned-test-suite/spec.md`
- Affected code areas for future implementation: `src/features/contracts/__tests__`, `src/features/remunerations/__tests__`, `src/features/dashboard/__tests__`, `src/features/employees/__tests__`, and `src/features/audit-logs/__tests__`
- No database migration required
- Multi-tenant and role-aware behavior become more explicitly protected by automated tests
