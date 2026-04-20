## Context

The product docs already define `Contract` as the main business aggregate that links a client, assigned collaborators, revenue plans, and lifecycle state. The current codebase, however, only implements `clients` and `employees`, and the Prisma schema still lacks `Contract`, `ContractEmployee`, `Revenue`, `Fee`, and `Remuneration` entirely.

That leaves the repository in an in-between state: route navigation and session policy already account for contracts, client deletion already probes for active contracts, and employee list rows still carry a placeholder contract count. The contract feature is therefore not just another list screen. It is the first aggregate slice that introduces multi-table writes, assignment-scoped visibility, and status-driven write protection in one feature.

## Goals / Non-Goals

**Goals:**
- Introduce a `contracts` feature slice that follows the documented schema-first workflow already used by `employees` and `clients`.
- Add the missing persistence foundation required for contract creation and management: `Contract`, `ContractEmployee`, and `Revenue`, with the lookup-backed fields defined by the product docs.
- Keep route files thin by placing list-query building, aggregate validation, mutation logic, and payload shaping inside the contract feature.
- Enforce assignment-scoped authorization and contract read-only semantics at the server boundary using authenticated session context.
- Preserve forward compatibility with later fee, remuneration, and attachment work without requiring those features to be implemented now.

**Non-Goals:**
- Implementing fee entry, remuneration generation, attachment upload, audit-log screens, or export behavior.
- Introducing a generic aggregate abstraction before the contract workflow stabilizes through real implementation.
- Redesigning the established route, overlay, cache, or HeroUI usage patterns documented by the repository contract.

## Decisions

### D1. The first contract change must materialize the aggregate persistence layer, not fake it behind stubs

The contract feature depends on real multi-entity state:
- `Contract` for the parent record and lifecycle fields
- `ContractEmployee` for team composition
- `Revenue` for required revenue plans created together with the contract

Without those models, the contract-management capability cannot enforce the documented create flow or assignment-scoped visibility. The initial change should therefore add the missing Prisma models, indexes, and lookup relations before trying to wire UI.

Alternative considered: implement only a contract list shell with mock or partial data while postponing assignments and revenues. Rejected because it would violate the documented rule that contract creation requires at least one assigned employee and at least one revenue.

### D2. Contract creation and editing must be aggregate server operations executed transactionally

The contract create flow is defined as one user action that submits:
- base contract fields
- at least one assignment
- at least one revenue

Those writes must succeed or fail together so the repository never persists a contract without required child records. The contract API layer should therefore validate the full payload and execute the parent and child writes inside one transaction.

Alternative considered: create the contract first and let assignments or revenues be added later through follow-up steps. Rejected because it weakens the product contract and creates invalid intermediate states that the business rules explicitly forbid.

### D3. Lookup-backed contract fields should use stable `value` identity at the application boundary

The contract aggregate introduces four lookup families:
- legal area
- contract status
- assignment type
- revenue type

The implementation should follow the existing repository rule that lookup-backed URL and form state bind by stable `value`, while server handlers resolve `value` strings to relational ids before persistence or filtering. This keeps contract filters and forms aligned with the current client and employee slices and avoids leaking database ids into user-facing state.

Alternative considered: use numeric ids for assignment and revenue rows because the aggregate is more relational than clients or employees. Rejected because it would split the application contract and make filters, bookmarks, and seeded lookup behavior environment-specific.

### D4. Assignment-scoped authorization should be derived from contract resources, not route-level assumptions

The product permission model distinguishes contract access from client access:
- administrators can view and mutate all contracts within the firm
- regular users can create contracts
- regular users can view and mutate only assigned writable contracts

The contract slice should therefore shape resource payloads that include the data needed by session policy, such as `firmId`, assignment membership, current status value, and status-lock semantics. The server remains authoritative for list scoping, detail access, update permission, delete/restore protection, and assignment changes.

Alternative considered: rely on the route to hide rows or actions and keep server checks shallow. Rejected because assignment visibility and writable state are core server-side policy, not display preferences.

### D5. Status-lock semantics should be modeled explicitly on the contract record as part of the first slice

The docs define `allow-status-change` behavior as administrator-controlled and distinct from ordinary activity state. The persistence model should therefore include an explicit field for this rule on the contract record rather than trying to infer it from status alone. That allows the contract slice to represent:
- active and writable contracts
- active contracts whose status transitions are locked
- completed or cancelled contracts that are business read-only

Alternative considered: defer the status-lock field until fee-driven auto-completion is implemented. Rejected because administrators already need to control the lock behavior in the contract feature itself, and future fee logic depends on the field existing.

### D6. The first contract UI should follow the canonical entity-management shape even though the form is aggregate-sized

The contract feature should still use:
- route-level validated search state and prefetching
- filter controls in the route header
- a server-backed table in the route body
- create and edit modals
- a details drawer
- delete and restore confirmations

The aggregate form can be larger and include repeated sections for assignments and revenues, but that complexity should remain inside feature-local form schemas, hooks, and components rather than forcing a new route pattern.

Alternative considered: give contracts a dedicated full-screen wizard because the form spans multiple sub-entities. Rejected for the first iteration because the repository contract defines modal create/edit flows as canonical, and there is not yet enough evidence that contracts require a documented exception.

## Risks / Trade-offs

- [Risk] The first contract slice is significantly broader than clients or employees and may tempt route-level shortcuts. → Mitigation: keep the workflow explicit in the design and sequence implementation by schemas, APIs, hooks, components, then route.
- [Risk] Assignment validation rules can become ambiguous when employee type and assignment type are mixed. → Mitigation: encode the documented compatibility matrix directly in feature validation and spec scenarios before implementation starts.
- [Risk] The aggregate transaction may become harder to evolve once fee and remuneration features arrive. → Mitigation: keep the first write boundary limited to contract, assignments, and revenues, and avoid prematurely absorbing downstream financial flows.
- [Risk] Status-lock semantics may be misread as a general write lock. → Mitigation: specify clearly in the contract spec which actions are blocked by read-only status versus status-change control.
- [Risk] Existing client and employee fallbacks might drift if the contract tables land but integration cleanup is skipped. → Mitigation: include those updates explicitly in the implementation tasks rather than treating them as optional polish.

## Migration Plan

1. Add the new `contract-management` spec delta so behavioral expectations are fixed before implementation.
2. Extend Prisma schema and seed support with the lookup families and aggregate models required for contracts, assignments, and revenues.
3. Build the `contracts` feature slice in the standard order: schemas, APIs, hooks, components, then route.
4. Wire server-side authorization and session-derived scoping for contract list, detail, create, update, delete, and restore operations.
5. Replace existing client and employee contract fallbacks with real queries backed by the new tables.
6. Verify the new slice against the documented route, overlay, and list-management patterns before moving on to fee or remuneration work.

Rollback is straightforward at the route level but heavier at the schema level. If the feature must be disabled after deployment, the route and feature can be removed while leaving the new tables unused; schema rollback should be treated as a controlled migration operation rather than the default recovery path.

## Open Questions

- Should the first contract detail drawer show child revenue and team summaries only, or expose full editable child detail once loaded?
- Should revenue editing in the first version allow add/remove operations freely while no fees exist, or should edits already be constrained to a narrower patch model?
- Is a modal large enough for the aggregate contract form in the current design system, or will the existing overlay primitives need a documented size/layout variant?
