## Why

Attachment cards consume excessive drawer height and present simple file metadata as form fields. A compact list will match surrounding details and make file actions easier to find.

## What Changes

- Align the attachment heading, count and upload action in one header.
- Replace cards with divided rows containing filename, compact metadata, download and a secondary actions menu.
- Match empty and loading states to the compact layout across all four owner drawers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: define compact, accessible drawer presentation and action hierarchy.

## Impact

Attachment presentation and client, employee, contract and expense detail compositions; focused UI tests and frontend documentation. All currently authorized users benefit. Tenant boundaries and permission enforcement remain unchanged. No dependencies or API changes.

## Non-goals

File previews, inline upload, storage changes, new file types and authorization changes.
