## Why

The project already has strong contract-oriented coverage, but several business-critical integrity branches remain untested in the areas most likely to regress aggregate behavior: employee lifecycle guards, fee reparenting and remuneration-preservation rules, contract lifecycle branches, and authentication or attachment failure handling. These gaps matter now because the repository treats tests as the executable contract for lifecycle, authorization, and derived financial behavior.

## What Changes

- Add focused Vitest coverage for employee delete and restore mutations, including blocked lifecycle conditions and audit behavior.
- Add focused Vitest coverage for fee update and lifecycle branches that preserve or block remuneration side effects during reparenting, disablement, delete, and restore flows.
- Add focused Vitest coverage for contract mutation branches that are currently under-specified by tests, especially successful lifecycle writes and read-only or initial-status guards.
- Add focused Vitest coverage for password reset success orchestration and attachment mutation failure branches.
- Update the OpenSpec test-suite contract to explicitly require these business-critical integrity cases.

## Non-goals

- No production behavior changes.
- No redesign of the existing testing strategy or feature architecture.
- No expansion into broad snapshot, visual, or end-to-end coverage.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `contract-aligned-test-suite`: tighten required Vitest coverage for high-risk integrity branches across employee lifecycle, fee lifecycle, contract lifecycle, authentication reset orchestration, and attachment failure handling.

## Impact

- Affected code: feature-local Vitest suites under `src/features/employees/__tests__`, `src/features/fees/__tests__`, `src/features/contracts/__tests__`, `src/features/authentication/__tests__`, and `src/features/attachments/__tests__`.
- Affected roles: indirect impact for administrators and regular users because coverage protects lifecycle, permission, and financial-integrity rules they rely on.
- Multi-tenant implications: no tenant-model change, but added tests reinforce firm-scoped lifecycle and authorization guarantees.
