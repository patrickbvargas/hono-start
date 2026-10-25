## Context

ContractDelete already owns the confirmation and protected deletion flow. The workspace has a shared useOverlay instance and validated return context.

## Goals / Non-Goals

**Goals:** Add only the existing delete action to the contract page.

**Non-Goals:** Expand page information, financial lists, restore controls, permissions or deletion rules.

## Decisions

- Derive delete visibility in useContractWorkspace from the independent delete grant and non-deleted state.
- Open ContractDelete through overlay.delete; keep dependency validation and safe error feedback in the existing server/hook flow.
- Pass an onDeleted route callback preserving validated contract-list or pending-list search. Navigate only after success.
- Reuse shared Button and existing overlays. Context7 is unavailable; existing repository APIs and installed types are the implementation reference.

## Risks / Trade-offs

- Active revenues block deletion at confirmation → existing server error toast explains the constraint; no cascade behavior.

## Migration Plan

No migration. Revert the small workspace/header and route changes to roll back.
