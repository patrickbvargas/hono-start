## MODIFIED Requirements

### Requirement: List attachments in supported owner contexts
The system SHALL display attachments inside client, employee, contract and expense detail drawers without leaving the parent context. A single shared-style heading SHALL align the count and authorized upload action. Files SHALL appear in compact divided rows with filename, type, file size and creation date visible without expansion. Download SHALL remain visible; authorized deletion SHALL be available through a secondary actions menu and retain explicit confirmation. Loading SHALL use matching skeletons. Empty and error states SHALL remain explicit. Tenant scope and existing permission checks SHALL remain enforced.

#### Scenario: Client details show client attachments
- **WHEN** a user opens an authorized client detail
- **THEN** only that client's attachments in the current firm are listed

#### Scenario: Employee details show employee attachments
- **WHEN** a user opens an authorized employee detail
- **THEN** only that employee's attachments in the current firm are listed

#### Scenario: Contract details show contract attachments
- **WHEN** a user opens an authorized contract detail
- **THEN** only that contract's attachments in the current firm are listed

#### Scenario: Expense details show expense attachments
- **WHEN** a user opens an authorized expense detail
- **THEN** only that expense's attachments in the current firm are listed

#### Scenario: Single compact header
- **WHEN** attachment data is available
- **THEN** one Anexos heading displays the count and permitted Anexar action on the same line

#### Scenario: Visible metadata and actions
- **WHEN** files exist
- **THEN** filename, type, size, date and download appear together without expanding
- **AND** deletion is offered in a keyboard-accessible menu only to authorized users

#### Scenario: Long filename and narrow viewport
- **WHEN** a filename exceeds the available line width
- **THEN** it wraps without pushing actions outside the drawer

#### Scenario: Loading and empty list
- **WHEN** data is loading
- **THEN** the header and row layout use skeleton placeholders
- **WHEN** the loaded list is empty
- **THEN** the section shows Nenhum anexo cadastrado and retains the permitted upload action

#### Scenario: Query failure
- **WHEN** attachment loading fails
- **THEN** the section displays a safe error and offers retry without leaving the drawer

#### Scenario: Download unavailable
- **WHEN** a file has no download URL
- **THEN** its download action is disabled

#### Scenario: Many attachments
- **WHEN** the file list exceeds approximately three compact rows
- **THEN** it scrolls inside a maximum height of 12rem while the heading and upload action remain outside the scroll area
