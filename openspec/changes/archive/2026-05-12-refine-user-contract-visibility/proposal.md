## Why

Regular-user contract visibility is too broad for referral flows. Today, an assigned non-admin user can reach contracts and contract financial context even when their participation is only as `Indicante`, which conflicts with the intended business ownership of the contract.

## What Changes

- Refine non-admin contract visibility to depend on assignment type and employee type, not only "is assigned".
- Prevent `RECOMMENDING` (`Indicante`) assignments from granting contract visibility to regular lawyers.
- Preserve contract visibility for non-admin lawyers assigned as `RESPONSIBLE` (`Responsável`) or `RECOMMENDED` (`Indicado`).
- Preserve contract visibility for non-admin administrative assistants assigned as `ADMIN_ASSISTANT`.
- Keep contract list and detail visibility binary: the regular user either sees the contract or does not.
- Keep fee (`honorário`) visibility restricted to allowed contracts under the refined access rule.
- Preserve own-remuneration visibility for regular users, including remuneration derived from contracts they can no longer open.

## Non-Goals

- Changing administrator visibility.
- Changing remuneration ownership rules or export scope.
- Reworking contract creation or remuneration calculation formulas.
- Expanding this change to unrelated employee or client permissions.
- Changing fee (`honorário`) visibility unless it is already indirectly constrained by the refined contract-access rules.

## Capabilities

### Modified Capabilities
- `contract-management`: refine regular-user contract list/detail visibility by assignment role.
- `fee-management`: refine regular-user fee visibility so referral-only contracts do not surface in `/honorarios`.
- `session-authorization`: make contract access decisions depend on assignment-role-aware resource context instead of assignment presence alone.
- `remuneration-management`: preserve own-remuneration visibility when the linked contract is not visible to the regular user.

## Impact

- Affected code: `src/shared/session/**`, `src/features/contracts/**`, and route consumers of contract details
- Affected specs: `openspec/specs/contract-management/spec.md`, `openspec/specs/session-authorization/spec.md`, `openspec/specs/remuneration-management/spec.md`
- Affected tests: session authorization tests, contract query/detail tests, and route/UI visibility tests
