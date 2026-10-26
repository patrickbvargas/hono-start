## Why

Attachment upload copy repeats limits and attachment lists do not identify who submitted each file. Users need clear instructions and reliable sender attribution.

## What Changes

- Simplify upload guidance and show actual remaining capacity.
- Display the original sender from the immutable attachment CREATE audit record.
- Show Autor não informado when no verifiable sender exists.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: Clear upload copy and original sender attribution.

## Impact

Attachment read model, tenant-scoped queries, shared attachment presentation, tests and domain documentation. Existing authenticated upload actors and permissions remain authoritative for all roles. No database migration or new dependency.

## Non-goals

Editing authors, changing permissions, exposing audit payloads or recovering authors without evidence.

## Follow-up scope

- Keep filename title and group size, date and sender in one metadata line.
- Reduce owner and batch capacity to 10; preserve existing files above capacity and block further uploads.
- Keep the limit in the shared product constant rather than environment configuration.
