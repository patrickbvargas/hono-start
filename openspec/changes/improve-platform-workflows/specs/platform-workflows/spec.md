## ADDED Requirements

### Requirement: Task-oriented navigation
The application SHALL group navigation into Trabalho, Financeiro, Cadastros and Administração and label the dashboard Visão geral and recorded fees Recebimentos, preserving URLs and permission filtering.

#### Scenario: Restricted member navigation
- **WHEN** a member opens the application
- **THEN** navigation exposes only routes allowed by the member's existing grants and settings contains only real available controls

### Requirement: Contract workspace
The application SHALL expose a protected full contract workspace with overview, finance, team, attachments and history, preserving quick drawers and return-list search context.

#### Scenario: Open from a filtered list
- **WHEN** a user opens a contract workspace from its drawer
- **THEN** the workspace loads through the protected detail boundary and its return action restores the originating contract filters

#### Scenario: Financial work
- **WHEN** a readable active contract has an open payable installment and the actor can create and read receipts
- **THEN** the finance tab offers the existing receipt form with contract, revenue and installment prefilled, and refreshes the existing queries after saving

#### Scenario: Read-only lifecycle
- **WHEN** a contract is completed, cancelled, inactive or deleted
- **THEN** contextual receipt creation is unavailable and server enforcement remains authoritative

#### Scenario: Scoped history
- **WHEN** an authorized auditor opens contract history
- **THEN** an embedded history table loads changes filtered by both exact entity type and ID, with local pagination and in-place change details, without navigating away or matching unrelated contracts by name

### Requirement: Visible authorized work
The dashboard SHALL retain an optional, default-hidden compact preview of authorized overdue installments in the selected dashboard scope and link each to contract finance. It MUST label preview scope and MUST NOT present a partial preview as a global total.

#### Scenario: Default dashboard
- **WHEN** a user opens the dashboard
- **THEN** the work preview is not rendered and its code remains available for future opt-in composition

#### Scenario: No overdue rows
- **WHEN** the current financial scope contains no overdue rows
- **THEN** the panel shows a clear scoped empty state without inventing outstanding work

### Requirement: Explain remuneration
Remuneration details SHALL explain stored receipt amount, effective percentage, generated amount and manual override status without asserting payout or recalculating a historical result from current collaborator settings.

#### Scenario: Manual override
- **WHEN** a remuneration has a manual override
- **THEN** its explanation states that stored amount and percentage are independent and identifies generated amounts as distinct from confirmed payment

### Requirement: Consistent form correction
Business forms SHALL preserve drafts, show shared error feedback and focus the first visible invalid field after an invalid submission. Existing dependent fields SHALL retain contextual disabled feedback.

#### Scenario: Invalid collapsed revenue
- **WHEN** an invalid contract revenue is collapsed and the user submits
- **THEN** the row opens and its first invalid control can receive focus

### Requirement: Useful settings
Authenticated users SHALL access current office information, existing account controls, theme preference and workflow guidance without changing company data or permissions.

#### Scenario: Theme preference
- **WHEN** a user selects an appearance
- **THEN** the existing theme preference applies across the application

### Requirement: Financial period shortcuts
The three financial lists SHALL offer Todo período and Este mês calendar-date shortcuts that preserve all other filters and reset pagination through the existing filter boundary.

#### Scenario: Change period
- **WHEN** the user selects Este mês while a contract filter is active
- **THEN** the dates become the current local calendar month's bounds and the contract filter remains active

### Requirement: Reviewed platform presentation
Contract drawers SHALL place workspace navigation in the desktop header and in the mobile body. Workspace headers SHALL avoid duplicate active labels while preserving inactive/deleted warnings. Settings cards SHALL retain their complete outline inside the scroll area.

#### Scenario: Responsive contract entry
- **WHEN** the drawer is viewed on desktop or mobile
- **THEN** exactly one workspace link is visible in the corresponding location

#### Scenario: Contract overview review
- **WHEN** a user opens the contract overview
- **THEN** the page shows contract data without the Próximo passo panel and the header displays its andamento as a badge

#### Scenario: Available attachment space
- **WHEN** attachments appear in the contract workspace
- **THEN** the list fills the remaining tab height and scrolls internally beneath its fixed heading without the compact drawer cap, and empty/loading states occupy only a single text line

#### Scenario: Direct workspace entry and presentation
- **WHEN** a user opens the contract list actions
- **THEN** the first action opens the workspace with preserved return filters; overview observations have a label spanning both columns and appearance choices include theme-switcher icons

### Requirement: Contract alerts
The workspace SHALL display alerts below contract data in Visão geral, derived from authorized contract data, separating overdue next due dates from informational remaining balances and missing active revenues or responsible assignments. Optional notes and attachments MUST NOT trigger missing-data alerts. Native related-record tooltips SHALL describe the detail action, and history SHALL omit its redundant explanatory footer.

#### Scenario: Outstanding future balance
- **WHEN** a revenue has a remaining balance but its next due date is today or later
- **THEN** the alert is informational and does not label the balance overdue

#### Scenario: Overdue revenue
- **WHEN** an active unsettled revenue has a next due date before the local calendar date
- **THEN** the alert identifies that date, distinguishes the total remaining balance from an overdue amount, and offers the finance tab

#### Scenario: Alert severity and overview placement
- **WHEN** a user opens Visão geral
- **THEN** alerts appear below contract data with labelled red/high, amber/medium or blue/low chips, and no separate Alertas tab exists

#### Scenario: Consistent history pagination
- **WHEN** the contract history has records
- **THEN** its pagination uses the shared 32px square button dimensions and chevron icons

### Requirement: Default inline contract navigation
Inline contract references SHALL open the contract workspace by default. Contract-list entry SHALL preserve validated return filters; explicit Ver detalhes menu actions SHALL retain drawer consultation.

#### Scenario: Open process from contract list
- **WHEN** a user activates an inline contract process or identifier
- **THEN** the workspace overview opens with list return context and no detail drawer
