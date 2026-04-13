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

1. The user opens a client, employee, or contract detail context.
2. The user starts the upload flow.
3. The user selects a supported file within the allowed size limit.
4. On success, the file appears in the attachment list.
5. On failure, the user sees a clear pt-BR error.
