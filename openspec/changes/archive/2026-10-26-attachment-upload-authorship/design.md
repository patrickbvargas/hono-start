## Context

Uploads already persist a session-derived actor snapshot in an immutable CREATE audit event, atomically with each attachment, including batches. Attachment summaries currently omit it.

## Goals / Non-Goals

Goals: clear pt-BR copy and original sender attribution across all attachment owners.
Non-goals: editable authors, new identity storage, migrations or full audit access.

## Decisions

Use existing CREATE actorName as the persisted sender source instead of duplicating identity columns. Fetch only entityId and actorName for returned attachment IDs within the authenticated firm in one batch. Use earliest CREATE by timestamp and ID; never substitute later modification actors. Empty/system-only attribution becomes null. The model validates nullable uploadedByName. Readers receive only the sender display name through existing attachment authorization, not audit payloads or email.

## Risks / Trade-offs

- Missing legacy CREATE event → explicit Autor não informado.
- One extra query per nonempty list, restricted to returned attachment IDs, with no per-file queries. New uploads enforce the current 10-file owner capacity; legacy owners above capacity remain readable.
- Sender snapshot does not follow account renames → intentional historical attribution.

## Migration Plan

No database change. Deploy and roll back application code normally.

## Open Questions

None.
