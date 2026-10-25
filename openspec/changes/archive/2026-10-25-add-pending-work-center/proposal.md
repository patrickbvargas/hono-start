## Why

Contract alerts require users to know which contract to inspect. A central operational queue surfaces actionable problems across authorized records and leads directly to their resolution.

## What Changes

- Add Pendências below Contratos with search, severity/type/client/collaborator filters, summary counts, deterministic server pagination and contextual entity links.
- Surface overdue schedules, remaining balances after all installments are recorded, upcoming installments in a seven-day window and settled active contracts needing status review.
- Keep inactive contracts with outstanding overdue revenue visible, exclude deleted contracts, and omit future receivables beyond the upcoming window and creation-invariant warnings.
- Derive pending state from source records; resolution happens through existing workflows.

## Capabilities

### New Capabilities
- `pending-work-center`: Authorized aggregate operational queue and contextual resolution.

### Modified Capabilities
None.

## Non-goals

Notifications, email, manual dismissal, task assignment, persisted alert records, payment processing and speculative missing-data rules for optional fields.

## Impact

New read-only feature slice and route, sidebar, contract alert presentation and domain documentation. Existing firm/assignment permissions remain authoritative, with separate financial subject checks. No migration or dependency.
