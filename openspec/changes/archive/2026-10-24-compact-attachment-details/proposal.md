## Why

Attachment cards consume excessive drawer height and present simple file metadata as form fields. A compact list will match surrounding details and make file actions easier to find.

## What Changes

- Align the attachment heading, count and upload action in one header.
- Replace cards with divided rows containing filename, compact metadata, download and a secondary actions menu.
- Match empty and loading states to the compact layout across all four owner drawers.
- Bound attachment list height to approximately three rows with scrolling.
- Support one atomic upload operation for up to 25 files and enforce a total of 25 non-deleted attachments per owner, including concurrent requests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: define compact, accessible drawer presentation and action hierarchy.

## Impact

Attachment presentation and client, employee, contract and expense detail compositions; focused UI tests and frontend documentation. All currently authorized users benefit. Tenant boundaries and permission enforcement remain unchanged. Batch upload request contract changes; no new dependencies or database migrations.

## Non-goals

File previews, inline upload, storage backend changes, new file types, observation fields and authorization changes.
