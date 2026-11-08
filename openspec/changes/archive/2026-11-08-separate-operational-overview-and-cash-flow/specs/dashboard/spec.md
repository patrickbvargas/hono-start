# dashboard Specification Delta

## MODIFIED Requirements

### Requirement: Authenticated Dashboard Landing
The system SHALL route operational contract overview to `/visao-operacional` and redirect the root route `/` to `/visao-operacional`.

#### Scenario: User opens home route
- **WHEN** an authenticated user opens `/`
- **THEN** the system redirects the user to `/visao-operacional`

#### Scenario: User opens operational overview route
- **WHEN** an authenticated user opens `/visao-operacional`
- **THEN** the system displays operational overview focused strictly on contracts, fee receipts, lawyer remunerations, and overdue contract installments

## REMOVED Requirements

### Requirement: Mixed Cash Flow and Corporate Expense Display
**Reason**: Financial treasury, generic expenses, and net cash flow statements are moved to the dedicated `/visao-financeira` route.
**Migration**: Users with financial permissions navigate to `/visao-financeira` to inspect corporate treasury and cash balance.
