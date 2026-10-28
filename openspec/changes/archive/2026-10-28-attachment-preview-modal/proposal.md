## Why

Attachment rows currently open files in another tab through the download action. Users need to inspect evidence without losing the record context.

## What Changes

- Open an accessible, spacious preview modal from an attachment row by pointer or keyboard.
- Show PDFs with a simple local PDF.js reader and fit JPG/PNG images inside the same preview layout. Share zoom controls; add page navigation for PDFs and preserve native full-feature reading through a new-tab action.
- Keep filename, type, size, creation date and uploader in a fixed header with right-aligned download, permitted deletion and close actions.
- Provide loading, safe error, retry and open-in-new-tab alternatives.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: Add contextual attachment previews across all existing owner contexts.

## Impact

The attachments feature, its shared section integration, focused tests and attachment behavior documentation. Reuse shared UI, overlay state, validated metadata and authenticated file delivery. Add pdfjs-dist with locally bundled worker and supporting assets; no database change. Existing read grants and owner/branch checks remain authoritative; deletion retains its permission and confirmation.

## Non-goals

PDF editing, annotations, search, thumbnails, new formats, cross-file navigation or permission changes.
