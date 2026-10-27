# Edge Cases

This file preserves canonical edge-case expectations for the product domain.

## Authentication

| Scenario | Expected Behavior |
|---|---|
| User enters OAB at login | Clerk email sign-in is required; OAB remains business data |
| User exceeds failed-login threshold | The system temporarily blocks further attempts and informs the user |
| Session expires during form work | The next protected action redirects to login and unsaved changes may be lost |
| Clerk verification or session tasks remain pending | The provider completes them before product access |

## Client Data

| Scenario | Expected Behavior |
|---|---|
| Two clients share the same CPF or CNPJ anywhere in the company | The system rejects the duplicate |
| Deleting a client with active contracts | The system blocks deletion with a clear explanation |
| Changing client type after creation with a mismatched document | The system rejects the update with the type-specific CPF or CNPJ validation message |

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

## Expenses

| Scenario | Expected Behavior |
|---|---|
| Expense amount is zero or negative | The system rejects the value |
| Expense references an inactive category already persisted on the record | The edit form keeps it visible but disabled |
| Regular user attempts to access expenses or expense attachments | Access is denied |

## Attachments

| Scenario | Expected Behavior |
|---|---|
| File exceeds allowed size | The system rejects the upload |
| File type is unsupported | The system rejects the upload |
| Attachment storage object cannot be removed during delete | The system keeps the attachment record and shows a clear delete failure |
| Attachment request carries multiple owner contexts including expense | The system rejects the request |

## Multi-Tenancy

| Scenario | Expected Behavior |
|---|---|
| User in one branch attempts to access another branch's operational record | Access is denied, including through shared client/employee references |
| Form references another branch's operational parent | The server rejects the reference |
| Form selects a global client or employee created from another branch | Selection is permitted under existing grants and active/non-deleted rules |
| Shared employee settings change in one branch | Every branch sees the same settings; persisted remuneration follows existing recalculation rules |

## Audit And Compliance

| Scenario | Expected Behavior |
|---|---|
| Business entity is created, updated, deleted, or restored | An immutable audit entry is recorded |
| Someone attempts to edit or delete audit history | The action is not allowed |

## Financial evidence

- Own remuneration read access does not expose another collaborator's attachments. Assigned receipt access does not expose an unassigned contract's receipt files.
- The last receipt may complete a contract; its proof can still be attached with financial read and attachment upload grants.
- Deleted financial owners/ancestors reject new uploads without deleting retained evidence. Restoring the financial ancestry permits uploads again.
- Financial evidence uses the same 10-file capacity and exactly-one-owner validation as other attachment contexts.

## Company-wide clients and employees

See [Multitenancy](MULTITENANCY.md) for the authoritative entity-scope matrix, global lifecycle, evidence visibility and current-Firm enforcement.
