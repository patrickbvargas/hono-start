## Context

One attachment section serves clients, employees, contracts, expenses, fees and remunerations. Rows already expose metadata, download and confirmed deletion. File delivery validates session, owner and branch access and returns private/no-store responses.

## Goals / Non-Goals

**Goals:** Context-preserving PDF/image inspection with an accessible fixed-header modal and independent row actions, safe failures and resource cleanup.

**Non-Goals:** PDF editing, annotations, search, thumbnails, additional formats or changes to storage, roles and tenancy.

## Decisions

- Use the section's shared overlay details scope selected by attachment ID; resolve current validated metadata from the existing list. Keep deletion in its separate scope so cancellation preserves preview and successful deletion closes it.
- Use shared Dialog parts and existing semantic tokens. A restrained document canvas fills most of the viewport, with fixed metadata and actions above it. Avoid a separate UI library or global abstraction.
- Keep the header compact: truncate long filenames with a full-name tooltip, place metadata and uploader on the same line when space allows, and vertically center actions. The new-tab action uses an underlined label followed by the upward-right navigation icon, matching entity navigation links.
- Attachment rows use 4px outer vertical spacing around their 8px hover padding. The loading skeleton matches this 64px row with file badge, filename/metadata and action placeholders; empty copy retains its compact single-line shape.
- Add feature query options for authenticated binary fetching, consumed by a feature data hook. Check response status and supported MIME type before exposing a Blob URL. Disable automatic retries, background refetch and retained binary cache; explicit retry creates a fresh request. Revoke Blob URLs on replacement/unmount.
- Render PDF with a dynamically loaded PDF.js engine and local worker/font/CMap/WASM assets. Display only the selected page with bounded bitmap memory (16 million pixels), cancel stale renders and destroy the loading task/worker on dismissal. PDF and images share a feature-local floating zoom toolbar; PDF adds page navigation and fit-to-width. Opening the original authenticated URL retains access to the full native viewer.
- Keep existing row download/context menus; put the primary preview button beside sibling action buttons to avoid nested buttons and accidental previews. Modal download uses a download link to the original same-origin endpoint.

## Risks / Trade-offs

- Canvas PDF reading omits selectable text, search, annotations and thumbnails → retain native reading in a new tab. Malformed and password-protected files receive safe retry feedback.
- Binary buffering uses memory → existing 10 MB limit, fetch only while preview mounted, zero retained cache and revoke object URLs.
- Nested overlays can disrupt focus → reuse existing Dialog/useOverlay and deletion confirmation; test dismissal, independent actions and deletion cancellation/success.

## Migration Plan

No database migration. PDF.js is a new frontend dependency. Deploy frontend changes and documentation together; rollback removes preview wiring without changing stored files.

## Open Questions

## Image zoom refinement

Images have a compact floating toolbar with zoom out/in (up to 800%), actual-size 100%, and fit-to-viewport. Fit never enlarges small images. ResizeObserver tracks the available canvas; image dimensions come from the native load event. Pointer capture supports mouse/touch panning inside clamped image bounds, and arrow keys provide keyboard panning. Changing scale, resizing, changing the file or retrying resets position. PDF uses the same floating zoom toolbar with page navigation and fit-to-width.

None blocking. PDF rendering and controls require a real-browser check on supported deployments.
