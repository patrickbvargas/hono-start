## Context

Current regular-user access treats contract visibility as a generic assigned/unassigned decision. That is insufficient for referral teams because a lawyer assigned only as `RECOMMENDING` should still receive remuneration while not gaining visibility into the underlying contract.

## Goals / Non-Goals

**Goals:**
- Make shared authorization capable of distinguishing assignment-based access by assignment type and employee type.
- Limit non-admin lawyer contract visibility to `RESPONSIBLE` and `RECOMMENDED` assignments.
- Preserve non-admin administrative-assistant visibility for contracts where the user is assigned as `ADMIN_ASSISTANT`.
- Keep contract visibility binary: full contract access when visible, no contract access when hidden.
- Apply the same refined visibility rule to fee (`honorário`) surfaces tied to the contract.
- Preserve own-remuneration access even when contract visibility is denied.

**Non-Goals:**
- Changing administrator behavior.
- Reworking remuneration generation formulas.
- Introducing a new role model or new assignment types.
- Rewriting the fees feature unless later implementation shows a route-critical dependency.

## Affected Capabilities

- `contract-management`
- `session-authorization`
- `remuneration-management`

## Decisions

### D1. Contract visibility becomes assignment-role-aware

Shared authorization for `contract.view` and contract-derived resource checks will stop using only `assignedEmployeeIds`. The access resource must carry enough information to determine whether the logged-in regular user is:

- a lawyer assigned as `RESPONSIBLE`
- a lawyer assigned as `RECOMMENDED`
- an administrative assistant assigned as `ADMIN_ASSISTANT`

`RECOMMENDING` alone does not grant contract visibility.

### D2. Shared authorization remains authoritative

The canonical `can(session, action, resource)` and `assertCan(session, action, resource)` helpers remain the single source of truth. Contract queries, details, and route-facing resource guards should pass richer access context into the shared authorization layer rather than duplicating feature-local logic.

### D3. Contract list and detail queries filter before mapping UI data

Contract list queries for regular users should filter at the Prisma boundary so `RECOMMENDING`-only contracts never enter the visible result set. Contract detail access checks should use the same assignment-role-aware rule before returning any contract payload.

### D4. Own remunerations remain independent from contract visibility

Remuneration queries continue to scope by employee ownership and firm. A regular user may keep seeing remunerations generated from a contract that is hidden because the user only participates as `RECOMMENDING`.

## Data / Resource Shape Changes

Contract and contract-derived access resources should move from broad "assigned ids" semantics to richer assignment summaries, such as:

- `employeeId`
- `employeeTypeValue`
- `assignmentTypeValue`
- `isActive`

This allows shared authorization to decide visibility without feature-specific wrappers.

## Implementation Outline

1. Extend shared session authorization resource types and policies for assignment-role-aware contract reads.
2. Update contract list/detail/access-resource queries to select active assignment summaries instead of only assigned employee ids.
3. Apply the refined visibility rule to contract list, contract detail, and any contract-derived authorization checks.
4. Apply the same refined visibility rule to fee list/detail and fee option access resources.
5. Preserve remuneration queries unchanged except for tests that prove visibility independence from contract access.

## Verification Strategy

- Authorization tests for regular lawyer `RECOMMENDING` denial.
- Authorization tests for regular lawyer `RESPONSIBLE` and `RECOMMENDED` allow.
- Authorization tests for regular admin assistant `ADMIN_ASSISTANT` allow.
- Contract list/detail tests proving `RECOMMENDING`-only contracts are excluded.
- Fee list/detail tests proving `RECOMMENDING`-only contracts do not surface in `/honorarios`.
- Remuneration tests proving own remunerations remain visible even when the linked contract would be hidden.
