## ADDED Requirements

### Requirement: Router root provides global error and not-found boundaries
The system SHALL define global TanStack Router boundaries at the root route for uncaught route errors and unmatched URLs. These global boundaries MUST render inside the shared root document shell so 404 and fallback error states remain visually consistent with the application shell.

#### Scenario: Unmatched route renders root not-found boundary
- **WHEN** a user navigates to a URL that does not match any route in the route tree
- **THEN** the router renders the root not-found boundary
- **AND** the response is not reduced to a generic uncaught error fallback

#### Scenario: Uncaught route error renders root error boundary
- **WHEN** a route throws an uncaught error without a more specific local override handling it
- **THEN** the router renders the root error boundary inside the shared root document shell

#### Scenario: Route-specific override remains possible
- **WHEN** a route defines a justified route-specific error boundary
- **THEN** that local override may handle the route failure instead of the root fallback
- **AND** routes without a justified override inherit the global fallback behavior
