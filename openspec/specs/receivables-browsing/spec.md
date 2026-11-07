# Spec: receivables-browsing

## Purpose

Provide authorized receivable consultation through a responsive collection, contextual summary and dedicated workspace, preserving precise financial balances and current-Firm visibility.

## Requirements

### Requirement: Authorized receivable navigation
The system SHALL expose Contas a receber at `/contas-a-receber` and a dedicated page at `/contas-a-receber/$receivableId` using the existing application navigation and permission model.

#### Scenario: Authorized navigation
- **WHEN** a user has an explicit receivables read grant
- **THEN** navigation offers Contas a receber and highlights it for the collection and dedicated page
- **AND** the existing Recebimentos route remains available under its current policy

#### Scenario: Missing read grant
- **WHEN** a user without a receivables read grant requests the collection or a direct title URL
- **THEN** access is denied without returning title data

### Requirement: Uniform financial read scope
The system SHALL apply current-Firm and explicit read grants to every title read, count, total, filter option and related protected resource.

#### Scenario: Assigned member
- **WHEN** a Member with read_assigned opens the collection
- **THEN** only titles bridged to contracts assigned to that actor in the active Firm are returned
- **AND** direct titles, unassigned contracts and other Firms do not affect counts, totals, options or results

#### Scenario: Direct access outside scope
- **WHEN** a user requests another Firm's title or a title outside their assignments by ID
- **THEN** summary, dedicated page, receipts, attachments and audit endpoints disclose no protected information

#### Scenario: Organization switch
- **WHEN** the user changes active organization
- **THEN** prior title data and options are cleared before the new scope renders

### Requirement: Responsive collection parity
The system SHALL follow the existing collection layout and interaction pattern, including desktop table, mobile cards, desktop view preference, internal scrolling, pagination and financial value masking.

#### Scenario: Desktop collection
- **WHEN** a user opens the collection on desktop
- **THEN** the table presents title identification, debtor, origin, kind, due date, situation and financial values
- **AND** nominal amount is the last data column before actions
- **AND** the user can switch to the existing card presentation

#### Scenario: Mobile collection
- **WHEN** a user opens the collection on mobile
- **THEN** cards expose debtor, due date, situation, balance and access to the same consultation actions
- **AND** filters, totals and pagination remain usable without clipping essential controls

### Requirement: URL driven filtering sorting and pagination
The system SHALL validate and preserve search, debtor, contract, origin, kind, financial state, inclusive due-date interval, analytic and expected method filters together with sorting and pagination in the URL.

#### Scenario: Search and filter application
- **WHEN** a user searches debtor name, notes or process number and applies filters
- **THEN** results match the intersection of all filters within authorized scope
- **AND** applying or removing a filter resets to the first page
- **AND** active chips and displayed controls agree with the URL after reload or browser navigation

#### Scenario: Stable page ordering
- **WHEN** titles share the chosen sort value
- **THEN** a stable ID tiebreaker prevents pagination drift
- **AND** default ordering is due date ascending followed by ID ascending

#### Scenario: Clearing filters
- **WHEN** the user clears filters through the header or empty state
- **THEN** pending debounced search is canceled and the same controller resets fields and URL defaults

### Requirement: Accurate filtered summary
The system SHALL display active nominal total, valid principal abated, open balance and overdue balance for the complete filtered selection, with canceled nominal value reported separately.

#### Scenario: Multiple pages
- **WHEN** filtered results span several pages
- **THEN** changing page does not change the filtered totals
- **AND** count and totals use the same authorized selection as the rows

#### Scenario: Canceled title
- **WHEN** the selection includes a canceled title
- **THEN** its nominal amount remains inspectable as canceled
- **AND** it contributes zero to active nominal, open and overdue totals

### Requirement: Principal cash and financial states
The system SHALL compute principal balance from non-reversed principal abatements and compute cash received separately from non-reversed effective amounts, preserving cent precision.

#### Scenario: Discounted settlement
- **WHEN** a R$ 100 title has an active receipt with R$ 100 principal and R$ 10 discount
- **THEN** its balance is R$ 0, cash received is R$ 90 and situation is Quitado

#### Scenario: Fully discounted settlement
- **WHEN** a R$ 100 title has an active receipt with R$ 100 principal and R$ 100 discount without charges
- **THEN** its balance is R$ 0 and cash received is R$ 0
- **AND** it is Quitado

#### Scenario: Reversed receipt
- **WHEN** a receipt has a reversal
- **THEN** that receipt does not reduce current principal balance or increase valid cash received
- **AND** its original event remains visible with reversal information to authorized receipt readers

#### Scenario: Partially settled overdue title
- **WHEN** a title has positive remaining balance, some principal abated and due date before today
- **THEN** its primary situation is Em atraso with partial-abatement information
- **AND** both the Parcial filter and Em atraso filter can find it

#### Scenario: Calendar boundaries
- **WHEN** a title without abatements is due today in America/Sao_Paulo
- **THEN** it is Pendente rather than Em atraso
- **AND** an unsettled title becomes Em atraso on the next civil day, including while the collection remains open

#### Scenario: Derived state before pagination
- **WHEN** a user filters by partial, settled or overdue state
- **THEN** state selection is applied before pagination and before totals are calculated

### Requirement: Equivalent record menus and primary navigation
The system SHALL expose the existing context-menu and dropdown interactions with equivalent consultation actions, and use the dedicated page as the primary record action.

#### Scenario: Desktop row context menu
- **WHEN** the user opens a row context menu by pointer or keyboard
- **THEN** Abrir página and Resumo target that persisted title ID, matching its dropdown actions
- **AND** no unimplemented write actions are displayed

#### Scenario: Mobile actions
- **WHEN** the user opens a card action menu
- **THEN** the same page and summary actions are available without requiring a right click

#### Scenario: Primary record action
- **WHEN** the user activates the main row or card action
- **THEN** the dedicated title page opens with the current collection search preserved as return context
- **AND** activating a nested action or related record does not also activate the primary action

### Requirement: Context preserving summary drawer
The system SHALL provide the existing contextual detail drawer experience, backed by the same title read model as the dedicated page.

#### Scenario: Summary follows the established entity layout
- **WHEN** an authorized user opens a receivable summary
- **THEN** the drawer uses the same compact header and responsive Abrir página link placement as other entity summaries
- **AND** main information appears directly as fields without an overview card or duplicated section heading
- **AND** observations, receipts, registration timestamps and authorized audit history use plain sections separated by dividers
- **AND** authorized attachments use their compact presentation rather than the dedicated-page card layout

#### Scenario: URL selected summary
- **WHEN** a user selects Resumo from the collection
- **THEN** detailId opens that title's drawer without resetting collection filters or refetching the collection solely for detail selection
- **AND** closing the drawer removes only detailId and preserves list context

#### Scenario: Contextual related title
- **WHEN** an authorized related title trigger is activated
- **THEN** its summary opens in a local overlay preserving the origin route and drawer
- **AND** hovering or focusing the trigger does not load title modules or data

### Requirement: Dedicated title workspace with tabs
The system SHALL use the existing dedicated workspace shell with URL selected Visão geral, Recebimentos, Anexos and Histórico tabs, subject to each tab's authorization.

#### Scenario: Overview and return context
- **WHEN** the user opens a title page
- **THEN** Visão geral presents identity, debtor, bridge-derived origin or Sem vínculo com contrato, kind, due date, analytic, expected method, notes, financial values and any cancellation information
- **AND** returning to the collection restores its prior filters, sort and page

#### Scenario: Receipt read permission
- **WHEN** an authorized title reader also has applicable receipt read permission
- **THEN** Recebimentos shows effective date, principal, discount, interest, penalty, cash, actual method and reversal status of persisted receipts
- **AND** it exposes no payment or third-party remuneration information

#### Scenario: Restricted tab URL
- **WHEN** the requested tab requires a grant the title reader lacks
- **THEN** Visão geral is selected and the restricted tab's data is not requested or returned

#### Scenario: Attachment and history consultation
- **WHEN** the user opens Anexos or Histórico with the required owner access and grant
- **THEN** existing attachment consultation or audit components display the title's authorized content
- **AND** attachment byte delivery rechecks owner access
- **AND** basic creation/update timestamps remain available without audit permission

### Requirement: Operational origins do not own title lifecycle
The system SHALL preserve visibility of authorized financial obligations independently from operational editing availability.

#### Scenario: Closed or deleted origin
- **WHEN** the originating contract is closed, canceled or logically deleted
- **THEN** its title remains in the authorized financial selection with its own financial state
- **AND** a related operational link is offered only when that related resource is readable

### Requirement: Consistent feedback accessibility and masking
The system SHALL use existing loading, empty, error, focus and value-visibility patterns across the collection, drawer and workspace.

#### Scenario: Hidden financial values
- **WHEN** global financial visibility is disabled
- **THEN** monetary values in rows, cards, totals, overview and receipt/reversal content use the existing R$ ••• presentation with accessible Valor oculto labeling
- **AND** permission scope and query inputs remain unchanged

#### Scenario: Empty or failed query
- **WHEN** no titles match or a request fails
- **THEN** the screen presents the existing localized empty or safe error treatment with relevant clear-filters, first-page or retry action
- **AND** no manual-create action is offered in this consultation-only change

#### Scenario: In-place route update
- **WHEN** filters, sort or pagination change
- **THEN** the existing in-place navigation feedback preserves the application shell
- **AND** initial detail loading uses the established skeleton treatment
