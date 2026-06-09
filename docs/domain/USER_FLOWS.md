# User Flows

This file preserves the canonical user workflows of the product. These flows describe intended user behavior and expected system reactions, not implementation details.

## Login

1. The user opens the application and reaches the login screen.
2. The user enters email or OAB number and password.
3. The user may select a remember-me option.
4. The user submits the form.
5. On success, the user is redirected to the dashboard.
6. On failure, the user sees a pt-BR error message.
7. Repeated failed attempts trigger temporary protection behavior.
8. The login flow is the only public entrypoint besides password reset.
9. No authenticated product screen is reachable without a valid session.

## Change Password

1. The authenticated user opens the account password-change flow from the product shell.
2. The user enters the current password.
3. The user enters and confirms a new password that satisfies policy.
4. The user may choose to revoke other active sessions.
5. The user submits the form.
6. On success, the system confirms the password change and keeps the current session usable.
7. On failure, the user sees a safe pt-BR error message.

## Forced Password Change After Administrator Reset

1. An administrator resets a collaborator password from the collaborator details flow.
2. The system generates a temporary password, invalidates the collaborator's active sessions, and marks the account for mandatory password change.
3. The administrator shares the temporary password with the collaborator.
4. The collaborator logs in with the temporary password.
5. The system redirects the collaborator to the mandatory password-change screen.
6. The collaborator enters and confirms a new password that satisfies policy.
7. On success, the system clears the mandatory-reset flag and allows access to the dashboard.

## Grant Collaborator Access

1. An administrator opens the collaborator details flow.
2. The administrator chooses the grant-access action.
3. The system creates or re-enables the collaborator's credential access.
4. The system generates a temporary password, invalidates old sessions, and marks the account for mandatory password change.
5. The administrator shares the temporary password with the collaborator.
6. The collaborator logs in and is redirected to the mandatory password-change screen before using the rest of the product.

## Revoke Collaborator Access

1. An administrator opens the collaborator details flow.
2. The administrator chooses the revoke-access action.
3. The system disables future credential login for that collaborator.
4. The system invalidates the collaborator's active sessions immediately.
5. The collaborator can only return after an administrator grants access again.

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
