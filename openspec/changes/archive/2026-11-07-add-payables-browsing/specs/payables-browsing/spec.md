## ADDED Requirements

### Requirement: Authorized payable collection
The system SHALL expose Contas a pagar and its dedicated title page only with explicit payable read grants and current-Firm scope.

#### Scenario: Own remuneration only
- **WHEN** a Member with read_own consults titles, options, totals or a direct ID
- **THEN** only titles whose beneficiary is that actor and whose remuneration originates from an assigned contract are accessible
- **AND** expenses, direct titles, other beneficiaries and other Firms disclose no data

#### Scenario: Admin collection
- **WHEN** an actor with read_all opens the collection
- **THEN** all titles in the active Firm are eligible including canceled titles and deleted operational origins

### Requirement: Responsive consultation parity
The system SHALL follow receivables layout with desktop table/cards, mobile cards, URL filters, search, stable sorting, pagination, masked monetary values and localized feedback.

#### Scenario: Filtered collection
- **WHEN** beneficiary, contract, origin, kind, state, inclusive due dates, analytic or expected method filters change
- **THEN** URL and chips agree and pagination resets
- **AND** totals cover the full authorized filtered selection before pagination

#### Scenario: Menus and return context
- **WHEN** a row/card primary action or consultation menu is activated
- **THEN** primary action opens its dedicated page and menus offer equivalent page/summary actions
- **AND** drawer close and page return preserve collection context

### Requirement: Accurate payable financial state
The system SHALL derive principal balance and cash paid separately from payments without reversal, with exact decimal arithmetic and São Paulo civil dates.

#### Scenario: Discount and reversal
- **WHEN** a 100 title has a valid payment with principal 100 and discount 10
- **THEN** balance is zero, cash paid is 90 and state is settled
- **AND** reversing the payment restores balance and excludes its cash from valid cash paid

#### Scenario: Overdue partial and cancellation
- **WHEN** a partially paid title is overdue
- **THEN** overdue is primary and both partial and overdue filters find it
- **AND** titles due today are not overdue and canceled nominal is reported separately from active totals

### Requirement: Protected title sections
The system SHALL offer overview, payments, attachments and history through established drawer/workspace patterns and independent authorization.

#### Scenario: Restricted tabs
- **WHEN** a requested tab lacks its applicable grant
- **THEN** overview is selected without fetching restricted content
- **AND** payment reads enforce both payable scope and payment scope

#### Scenario: Protected evidence
- **WHEN** an attachment metadata/byte or audit endpoint is requested
- **THEN** owner visibility is rechecked and foreign or other-beneficiary data is denied
- **AND** title attachments are read-only and original payments retain reversal information

#### Scenario: Consultation scope
- **WHEN** a title is inspected
- **THEN** no unimplemented create, edit, cancellation, settlement or reversal actions are offered
