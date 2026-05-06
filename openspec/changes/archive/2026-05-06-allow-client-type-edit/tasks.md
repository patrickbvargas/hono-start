## 1. Contract updates

- [x] 1.1 Update the owning domain docs so client type is no longer described as fixed after creation.
- [x] 1.2 Update the `client-management` main spec and delta intent to describe editable type behavior during client updates.

## 2. Client slice behavior

- [x] 2.1 Remove the client-type immutability guard from the clients slice while preserving lookup existence and inactive-selection protection.
- [x] 2.2 Allow the client edit form to change the selected type and keep label/document expectations reactive to that selection.
- [x] 2.3 Persist the resolved `typeId` during client updates and validate the submitted document against the selected type.

## 3. Verification

- [x] 3.1 Update focused client tests to cover editable type behavior and remove obsolete immutability expectations.
- [x] 3.2 Run `pnpm check`, focused Vitest coverage, and `npx tsc --noEmit`.
