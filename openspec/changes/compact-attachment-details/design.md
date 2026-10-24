## Context

The four entity drawers wrap AttachmentSection in a titled section. The feature then renders a separate upload line and large metadata cards. Existing hooks already own permissions and overlays.

## Goals / Non-Goals

**Goals:** Compact, consistent and keyboard-accessible file management in every supported drawer.

**Non-Goals:** Preview, storage, API, permission or upload workflow changes.

## Decisions

- Let AttachmentSection own its single shared SectionTitle, count and upload header; remove redundant parent wrappers and match the fallback. This avoids broadening EntityDetail for a feature-specific need.
- Render divided rows with a type marker, wrapping filename and one metadata line. Keep download visible and move permanent deletion into the existing shared dropdown primitives. Retain the existing confirmation overlay.
- Preserve existing hooks, Zod read models, cache invalidation, modal upload and semantic theme tokens. No new abstraction or dependency.
- Reuse local dropdown examples and shared exports. Context7 is unavailable in this session; inspect existing shared primitive signatures instead.

## Risks / Trade-offs

- Long filenames can grow rows → allow wrapping while actions remain fixed width.
- Deletion needs one extra click → secondary destructive action is less prominent, with existing confirmation retained.
- Main attachment spec still describes an older accordion → replace its listing requirement in the delta to match the agreed visible metadata layout.

## Migration Plan

Deploy presentation and four owner compositions together. No data migration. Revert presentation files to roll back.

## Open Questions

None.
