## Why

Clients and employees must be reusable throughout the same company. Branch membership and profile layers introduced unnecessary steps; every branch should see the same records through existing screens.

## What Changes

- Keep original Client and Employee entities and remove firmId, without profile/membership tables.
- Share all employee settings and lifecycle state. Keep operations and financial data local to Firm.
- Share master attachments and audit using owner identity, preserving origin firm and storage paths.
- Remove link-directory actions and explanatory notices from the frontend.
- Preserve existing master IDs during the flattening migration; reject duplicate legacy memberships for explicit reconciliation rather than guessing Clerk anchors.

## Impact

Prisma, backend master queries/writes/selectors, session identity, evidence authorization, seed and documentation. Existing screen contracts remain unchanged. A new migration follows the already-created profile migration so applied databases are not rewritten in place.
