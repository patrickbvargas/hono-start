# Edge Cases

This file preserves canonical edge-case expectations for the product domain.

## Authentication

| Scenario | Expected Behavior |
|---|---|
| User enters OAB in lowercase | The system normalizes the value |
| User exceeds failed-login threshold | The system temporarily blocks further attempts and informs the user |
| Session expires during form work | The next protected action redirects to login and unsaved changes may be lost |

## Client Data

| Scenario | Expected Behavior |
|---|---|
| Two clients share the same CPF or CNPJ in one firm | The system rejects the duplicate |
| Deleting a client with active contracts | The system blocks deletion with a clear explanation |
| Trying to change client type after creation | The system does not allow it |

## Contract And Team

| Scenario | Expected Behavior |
|---|---|
| Contract created without revenues | The system rejects creation |
| Duplicate revenue type on one active contract | The system rejects the duplicate |
| Referrer percentage exceeds referred lawyer percentage | The system rejects the assignment |
| Removing an employee who has active remunerations on that contract | The system blocks the removal |
| All installments are paid on all active revenues | The contract becomes completed unless the status lock prevents it |
| Contract status is locked while automatic completion would happen | The completion transition is blocked by the lock |

## Fees And Remunerations

| Scenario | Expected Behavior |
|---|---|
| Fee created with remuneration generation disabled | The fee is recorded without remuneration records |
| Fee updated after remuneration generation | Linked remunerations are recalculated when the business rule requires it |
| Fee updated with remuneration generation disabled | Existing remunerations remain unchanged |
| Fee soft-deleted | Linked remunerations are soft-deleted |
| Fee restored | Linked remunerations are restored |
| Down payment exceeds total value | The system rejects the value |
| Installment number duplicates an active installment in the same revenue | The system rejects the duplicate |
| Installments paid would exceed total installments | The system prevents the invalid state |

## Attachments

| Scenario | Expected Behavior |
|---|---|
| File exceeds allowed size | The system rejects the upload |
| File type is unsupported | The system rejects the upload |

## Multi-Tenancy

| Scenario | Expected Behavior |
|---|---|
| User from one firm attempts to access another firm's data | Access is denied |
| Form tries to reference another firm's entity | That entity is not available for valid selection |

## Audit And Compliance

| Scenario | Expected Behavior |
|---|---|
| Business entity is created, updated, deleted, or restored | An immutable audit entry is recorded |
| Someone attempts to edit or delete audit history | The action is not allowed |
