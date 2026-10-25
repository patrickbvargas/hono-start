# entity-management-pages Specification

## Purpose
TBD - created by archiving change entity-management-pages. Update Purpose after archive.
## Requirements
### Requirement: Primary collections open dedicated record pages
The system SHALL open a dedicated page by default from record identity triggers and mobile cards in clients, employees, contracts, fees, expenses, remunerations and audit logs. Collection action menus SHALL provide an explicit page action.

#### Scenario: Open from a collection
- **WHEN** a user selects a record identity or its page action
- **THEN** the dedicated page displays that record and retains validated collection filters, sorting and pagination for return

### Requirement: Record pages follow the contract workspace layout
Pages SHALL provide an application heading, record identity, applicable status, visible permitted lifecycle actions, a return link and addressable tabs. Overview SHALL preserve existing record fields and related links. Existing attachment owners SHALL have an expanded attachments tab; business records SHALL have permission-scoped history. Audit records SHALL remain read-only.

#### Scenario: Manage an existing record
- **WHEN** a user opens an authorized business record
- **THEN** its overview and applicable tabs are available and edit/delete/restore use existing permissions, lifecycle constraints and confirmations

#### Scenario: Record is deleted successfully
- **WHEN** deletion succeeds from a dedicated page
- **THEN** the user returns to the validated collection context

#### Scenario: Read an immutable audit record
- **WHEN** an authorized user opens an audit record page
- **THEN** its summary and change details appear without edit, delete or restore controls

### Requirement: URL state and access remain safe
Pages SHALL validate positive numeric identifiers, supported tabs and feature-specific return state. Invalid tabs SHALL select overview. Missing or invalid return state SHALL use collection defaults. Existing protected detail queries SHALL preserve firm, own and assigned restrictions; unavailable records SHALL display safe route errors.

#### Scenario: Reload a selected tab
- **WHEN** a user reloads a valid page with a tab and return state
- **THEN** the same tab and return context remain selected

#### Scenario: Invalid navigation input
- **WHEN** a page receives an unknown tab or external return URL
- **THEN** overview and the safe collection fallback are used

### Requirement: Contextual drawers remain operational
The system SHALL preserve existing detail drawers and legacy detailId URLs. Related-record links SHALL open contextual drawers above the originating page or drawer and retain permitted edit, delete and restore actions with existing query refresh behavior.

#### Scenario: Inspect and edit a relationship
- **WHEN** a user opens and edits a related entity from a page
- **THEN** existing overlays display above the drawer, updates refresh existing queries and closing the drawer restores the original page and tab

### Requirement: Workspaces remain usable at narrow and short viewports
The system SHALL keep record identities readable, actions accessible, tabs navigable and content scrollable at narrow and short viewports, following shared UI styling and existing overlay layering.

#### Scenario: Use a record page on mobile
- **WHEN** a user opens a record from a mobile card
- **THEN** the page fits the viewport and its actions, return link and applicable tab content remain reachable

### Requirement: Pages share a visual and information hierarchy
All record pages, including contracts, SHALL use the same compact identity row and application-header actions, action labels, section spacing and content widths. Business lifecycle state SHALL appear once in the header. Registration dates SHALL live in history. Contact, financial and audit change content SHALL use meaningful URL-addressable sections instead of copying complete drawer content into overview. Drawers SHALL retain their complete content and actions.

#### Scenario: Compare contract and receipt pages
- **WHEN** a user opens either record page
- **THEN** actions occupy the same application-header position with Editar, Excluir and Restaurar labels when allowed, and overview does not duplicate lifecycle badges or financial-tab contents

#### Scenario: Inspect complete contextual details
- **WHEN** a user opens a contextual drawer after the page reorganization
- **THEN** existing fields, financial explanations, registration data and permitted actions remain available in the drawer

### Requirement: Related collections are directly accessible
Permitted users SHALL navigate from receipt remuneration counts to a remuneration collection scoped to that exact receipt ID. The visible removable receipt filter SHALL apply equally to records, totals and exports, intersecting existing firm and own/all visibility. Employee financial sections SHALL link to the corresponding remuneration collection only when that employee is readable under remuneration scope. Singular related-record links SHALL retain contextual drawers.

#### Scenario: Inspect remuneration generated by one receipt
- **WHEN** a permitted user follows the receipt remuneration link
- **THEN** the destination contains only authorized remuneration for that receipt, retains the scope across pagination and export, and offers a removable Recebimento filter

### Requirement: Client and employee pages summarize related contract alerts
Client and employee overview pages SHALL preview up to five related contract alerts using the central pending-work rules and exact client or active employee assignment IDs. Preview totals SHALL describe the entire authorized scope and link to its filtered pending-work collection. Contract inspection SHALL use contextual drawers. Missing subject grants SHALL prevent preview queries; loading, safe retryable errors and empty states SHALL remain local to the preview.

#### Scenario: Review a client's pending contracts
- **WHEN** a user with contract and receipt read grants opens a client overview
- **THEN** its preview and collection link include that client ID and preserve current firm, assignment and financial restrictions

#### Scenario: Review a collaborator's contract alerts
- **WHEN** the user opens an employee overview with the required grants
- **THEN** alerts apply only to that employee's active contract assignments intersected with the viewer's authorized scope, without per-contract query fan-out

### Requirement: Fixed workspace and internal panel scrolling
The workspace wrapper SHALL remain fixed within the available viewport. Identity, record ID and status SHALL share one compact row. Tabs SHALL fill remaining height with internal panel scrolling, while expanded attachment panels retain their internal scrolling. Lifecycle actions SHALL appear in the application header. Remuneration finance pages SHALL omit the two explanatory paragraphs removed in visual review.

#### Scenario: Narrow and short workspace
- **WHEN** a record page opens at a narrow or short viewport
- **THEN** header actions remain reachable, identity stays compact, and scrolling the selected tab leaves page chrome fixed

### Requirement: Flexible related alert list
Client and employee overview pages SHALL reserve remaining tab height for the related contract alerts section. Its list SHALL scroll internally using the shared scrolling component while general fields, alert heading and summary remain outside the list scroller. Identity rows SHALL retain vertical breathing room.

#### Scenario: Alert list exceeds available space
- **WHEN** linked contract alerts exceed the available overview height
- **THEN** the alert list scrolls internally and its heading and general entity fields remain visible
