## Context

Seven feature mutation modules supply English description literals to createAuditLog, which persists them unchanged. Read helpers already localize historical records.

## Goals / Non-Goals

**Goals:** Persist new observations in pt-BR using the existing feature-owned mutation pattern.

**Non-Goals:** Change codes, payloads, actor snapshots, read presentation or historical rows.

## Decisions

Translate description templates at their existing call sites. This preserves event-specific wording (including attachment uploads and fee installments), avoids adding a translation abstraction, and leaves the persistence helper unchanged. Generating generic descriptions centrally was considered but would unnecessarily replace the existing event-specific messages.

Keep existing read localization for historical compatibility. No migration is required.

## Risks / Trade-offs

- Future mutations could introduce English observations → document the language contract and extend existing mutation assertions.
- Existing historical observations remain English in storage → preserve immutability and existing localized reads.

## Migration Plan

Deploy code normally. Rollback restores prior templates for future events only; never rewrite history.

## Open Questions

None.
