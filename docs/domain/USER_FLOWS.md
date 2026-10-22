# User Flows

This file preserves the canonical user workflows of the product. These flows describe intended user behavior and expected system reactions, not implementation details.

## Login and account management

1. Open `/login` and authenticate through Clerk email or username sign-in.
2. Complete any provider verification or session tasks and select an authorized firm.
3. Enter product screens only with current membership and an active linked Employee.
4. Recovery is available through Clerk from `/recuperar-senha`; OAB is not a credential.
5. Open account management from the shell to manage credentials through Clerk.
6. Signing out cancels requests and removes protected cached data.

## Grant or change collaborator access

1. An actor with `org:accounts:manage` opens an active same-firm collaborator.
2. Select an explicitly delegable Clerk role.
3. The system links a Clerk identity and sends an Organization invitation, or updates an existing membership role.
4. The collaborator completes Clerk email verification/setup and accepts the invitation.
5. Partial operations show failure and support retry; unmatched identities never gain product access.
6. No temporary password is generated or shared.

## Revoke collaborator access

1. An authorized account manager opens a same-firm collaborator.
2. Revoke the current firm's membership and pending invitations.
3. Subsequent protected requests fail immediately on current provider verification.
4. Other Organization memberships and business/audit history remain intact.
5. Restoring access requires an eligible employee and an explicitly selected role.

## Register A Client

1. The user opens the clients list.
2. The user starts the new-client flow.
3. The user selects whether the client is an individual or company.
4. The form adapts labels and validation to the selected type.
5. The user fills required fields and saves.
6. On success, the system confirms via toast, closes the overlay, and refreshes the list.
7. On validation failure, inline pt-BR errors are shown.

## Create A Contract

1. The user opens the contracts list.
2. The user starts the new-contract flow.
3. The user selects a client, enters process number, chooses legal area, sets fee percentage, and fills optional notes.
4. The user assigns at least one collaborator to the contract.
5. The user defines at least one revenue plan.
6. The user saves the contract.
7. On success, the system confirms via toast, closes the overlay, and refreshes the list.

## Record A Fee And Generate Remunerations

1. The user opens the fees flow.
2. The user selects the contract and the target revenue.
3. The user enters payment date, amount, and installment number.
4. The user decides whether remuneration generation is enabled.
5. The user saves the fee.
6. The system creates the fee, updates payment progress, and generates remunerations when enabled.
7. The system re-evaluates contract completion after the new payment state.

## Register An Expense

1. An administrator opens the expenses list.
2. The administrator starts the new-expense flow.
3. The administrator selects a category, enters date and amount, and optionally fills observation.
4. The administrator saves the expense.
5. On success, the system confirms via toast, closes the overlay, and refreshes the list.
6. The administrator may open the details drawer to inspect observation, attachments, and audit-oriented metadata.

## View And Export Remunerations

1. The user opens the remunerations surface.
2. Scope is determined by role.
3. Summary values are shown in the page context.
4. The user may filter by supported criteria such as date range, contract, or employee.
5. The user may export in PDF or spreadsheet format with the supported filters.

## Soft Delete And Restore

1. An administrator chooses a supported delete or restore action.
2. The system requires explicit confirmation.
3. The system blocks the action when active dependents forbid it.
4. On success, the list and visibility state refresh consistently.

## Upload An Attachment

1. The user opens a client, employee, contract, or expense detail context.
2. The user starts the upload flow.
3. The user selects a supported file within the allowed size limit.
4. On success, the file appears in the attachment list.
5. On failure, the user sees a clear pt-BR error.

## Delete An Attachment

1. An administrator chooses the delete action for an attachment.
2. The system removes the stored file from attachment storage.
3. The system removes the attachment record.
4. On success, the attachment no longer appears in the list.
5. On failure, the system keeps the record unchanged and shows a clear pt-BR error.
