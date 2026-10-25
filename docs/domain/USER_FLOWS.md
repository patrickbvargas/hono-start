# User Flows

This file preserves the canonical user workflows of the product. These flows describe intended user behavior and expected system reactions, not implementation details.

## Login and account management

1. Open `/login` and authenticate through Clerk email or username sign-in.
2. Complete any provider verification or session tasks and select an authorized firm.
3. Enter product screens only with current membership and an active linked Employee.
4. Recovery is available through Clerk from `/recuperar-senha`; OAB is not a credential.
5. Open account management from the shell to manage credentials through Clerk.
6. Signing out cancels requests and removes protected cached data.

## Manage accounts in Clerk

1. Register business collaborators in the app independently of accounts.
2. Create or invite users and assign Organization roles in Clerk Dashboard.
3. Optionally set privateMetadata.employeeId to an active business Employee ID for own/assigned visibility.
4. Sign-in validates current provider membership, permissions and any explicit business link.
5. Missing employeeId disables own/assigned access while general granted operations remain available.
6. Revoking or deleting a Clerk account leaves Employee and financial/audit history unchanged.

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

## Navigate Related Records

- Singular entity triggers open the target record's details drawer by ID over the current screen, without route navigation, a name search or intermediate row selection. This applies to clients, employees, contracts and source fees.
- Collection links (contracts for a client/employee, fees for a revenue) keep opening the filtered list.
- Related drawers label their dismiss action Voltar; the main detail keeps Fechar. Related triggers have no navigation icon. Closing the related drawer reveals the origin details with the original list, filters and scroll context intact. Related details retain edit/delete/restore actions when authorized. Read permissions and server resource checks remain enforced.

- Advanced filter panels start closed, including when navigation supplies active filters. Applied filters remain visible as chips; users expand Mais filtros manually.


## Connected platform work

Navigation groups Visão geral and Contratos under Trabalho; Recebimentos, Remunerações and Despesas under Financeiro; Clientes and Colaboradores under Cadastros; Auditoria and Configurações under Administração. Existing URLs remain unchanged.

Contract drawers retain quick consultation and offer Abrir página do contrato. The protected /contratos/$contractId workspace contains Visão geral, Financeiro, Equipe, Anexos and Histórico tabs. Opening from a contract list preserves its validated search for the return link. Finance reuses the drawer's revenue summary, existing lifecycle checks and prefilled receipt form. Readable receipts and remunerations have contract-filtered collection links; audit readers see an embedded history table scoped to exact Contract type and ID, paginated in place with change details available in a drawer. Other-entity audit events remain in their own records.

The overview retains an optional work preview component, hidden in the application by default at user request. When explicitly enabled by composition it shows up to three existing authorized overdue installments before its analytics. The preview follows the selected filters and reference date; it is not a global pending count. Each eligible link opens the contract financial tab. No additional aggregation or outflow calculation is implied.

Financial lists offer Todo período and Este mês shortcuts that change only calendar dates and reset pagination, preserving other filters. Remuneration details expose Entender cálculo with stored receipt amount, effective percentage, amount and manual-adjustment copy. Generated remuneration does not confirm payout.

Configurações offers readonly current office/account information, the existing account profile dialog, browser-wide theme preference and workflow guidance. Access administration remains outside this screen; no office setting is written by this change.

Product review: the workspace link lives in contract drawer headers from sm and in the body on mobile. Workspace headers show the contract andamento once, adding lifecycle badges only for inactive/deleted records. Settings content reserves inset space for card outlines.

Contract overview omits the Próximo passo guidance panel. Its header uses a shared andamento badge; inactive/deleted warnings remain separate. The history tab displays the changes table directly without requiring navigation to Auditoria.

The workspace header offers Excluir contrato to actors with contract delete permission for non-deleted contracts. It reuses the existing confirmation and protected soft-delete flow, including the active-revenue deletion block. Success returns to the originating validated contract list or pending queue with filters preserved; cancellation or failure keeps the current page.

Contract list action menus start with Abrir página do contrato and preserve the list search as return context. The overview labels Observações across both columns. Workspace attachments fill available tab space with internal scrolling, while drawers retain compact scrolling and a compact single-text-line empty/loading height. Appearance buttons pair Sistema, Claro and Escuro with the same icons as the theme switcher.

The contract overview displays alerts below its data and derives pending next due dates, remaining balances, missing active revenues and missing active responsible assignments from the authorized contract detail. Future balances are informational rather than overdue debt; the total remaining balance is not presented as the overdue amount. Optional notes and attachments are not required. Actions open the existing finance/team tabs.

Alert severity uses labelled color chips: Alta/red for overdue next due dates, Média/amber for missing active revenue or responsible assignment, Baixa/blue for other remaining balances. History pagination uses the same 32px square buttons and chevron icons as other tables. Legacy tab=alerts search falls back to overview.

Inline contract identifiers/process numbers and mobile contract card actions open the workspace by default, preserving contract-list return filters. Related contract links from other records also navigate to the workspace. The explicit Ver detalhes menu action remains available for quick drawer consultation.
