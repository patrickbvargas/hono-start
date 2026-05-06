## Context

The clients slice already supports type-driven labels and document validation, but the update path adds an extra immutability guard that rejects changing `type`. The UI also disables the type selector during edits.

Because type-dependent document validation is already modeled as a pure rule plus server-side lookup resolution, enabling type edits should be a small behavioral change rather than a structural refactor.

## Goals / Non-Goals

**Goals:**
- Remove the artificial edit-time immutability guard for client type.
- Keep lookup-value resolution and inactive-lookup protection unchanged.
- Ensure update writes persist the new `typeId` and still validate the submitted document against the selected type.
- Align the main client-management spec and domain docs with the implemented behavior.

**Non-Goals:**
- Changing create-flow behavior.
- Introducing migration or data backfill work.
- Rewriting the client validation architecture.

## Decisions

### D1. Keep type validation selected-value driven on both create and update

Client document validation should continue to derive from the submitted type value, not from the persisted pre-edit type. That keeps the update path symmetric with create and makes the form behavior predictable when users switch between PF and PJ.

### D2. Preserve inactive lookup protection for changed types

The existing lookup rule already allows keeping an inactive persisted type on update while blocking selection of a different inactive type. That behavior remains valid and should stay unchanged when type edits become allowed.

### D3. Persist `typeId` during updates instead of treating type as presentation-only

Once the immutability guard is removed, the update mutation must write the resolved lookup id alongside the other editable client fields. Without that change, the UI would appear to allow type edits without actually saving them.

### D4. Update docs and delta spec in same change

This is a product-truth change, not only an implementation fix. The owning domain docs and `client-management` spec must move together with the code so future contributors do not reintroduce the old restriction.

## Risks / Trade-offs

- [Risk] A user can switch type without updating the document. -> Mitigation: keep schema and server validation tied to the currently selected type so the update fails safely.
- [Risk] Inactive lookup handling might regress when persisted and submitted types differ. -> Mitigation: preserve the current `assertTypeCanBeSelected(type, client.typeId)` behavior.
- [Risk] Main specs and delta specs can drift because this work started from direct code edits. -> Mitigation: capture the behavior in a dedicated delta spec and sync before archive.

## Migration Plan

1. Update the `client-management` delta spec to describe editable client type behavior.
2. Remove the immutability guard and enable the edit-form type selector.
3. Persist `typeId` on updates and keep selected-type document validation.
4. Update focused tests, then sync and archive the change.
