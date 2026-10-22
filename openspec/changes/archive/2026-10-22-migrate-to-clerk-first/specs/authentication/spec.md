## REMOVED Requirements

### Requirement: Users authenticate with email or OAB number plus password
**Reason**: Clerk-native email or username authentication replaces custom employee/OAB credential resolution; firm-scoped OAB uniqueness is incompatible with assuming global Clerk username uniqueness.
**Migration**: Keep OAB as domain data; use the Clerk-owned sign-in experience and email or globally unique username identity.

### Requirement: Credential login requires an active linked employee and an unbanned Supabase Auth account
**Reason**: Supabase no longer owns authentication.
**Migration**: Use verified Clerk session, membership and active Employee mapping.

### Requirement: Remembered sessions follow documented duration rules
**Reason**: Clerk owns session lifetime configuration, replacing per-login custom duration selection.
**Migration**: Remove the custom remember-me control and document effective Clerk settings.

### Requirement: Administrator-issued temporary passwords force a password change on next login
**Reason**: Invitations and Clerk account setup/recovery replace locally orchestrated temporary credentials.
**Migration**: Migrate existing flagged accounts through provider setup/reset and retire local forced-password authority.

## MODIFIED Requirements

### Requirement: Public authentication routes exist outside the authenticated shell
The system SHALL expose `/login` and a compatible `/recuperar-senha` entry outside the authenticated shell under `_auth`. Authentication routes SHALL render Clerk-supported sign-in/recovery behavior within feature-owned presentation, with pt-BR localization and any required catch-all paths for provider navigation.

#### Scenario: User opens authentication routes
- **WHEN** an unauthenticated user opens login or recovery
- **THEN** the Clerk authentication experience renders without the product sidebar or a prior product session

### Requirement: Protected routes require authenticated session
The system SHALL gate `_app` in `beforeLoad` using a verified active Clerk session, completed session tasks, current organization membership and a valid domain actor mapping. ClerkProvider SHALL own provider state; the shared session query SHALL only project the domain actor and safe capabilities.

#### Scenario: Missing or pending session
- **WHEN** a signed-out user or a user with incomplete Clerk session tasks enters a protected route
- **THEN** protected loaders and product content do not continue
- **AND** the user is directed to the appropriate Clerk authentication/task flow

#### Scenario: Authenticated user revisits login
- **WHEN** a fully authenticated, mapped user visits a public authentication entry
- **THEN** the route redirects to the safe requested destination or the authenticated home

### Requirement: Password reset is supported
The system SHALL delegate password recovery and completion to Clerk-supported flows with safe feedback and no application-owned reset tokens or credential storage.

#### Scenario: Recovery completes
- **WHEN** a user completes Clerk verification and supplies a password accepted by the configured provider policy
- **THEN** Clerk updates the credential and the app continues only after required session tasks are complete

#### Scenario: Recovery fails
- **WHEN** a reset verification is invalid, expired or an identifier is unknown
- **THEN** the system displays safe provider-localized feedback without exposing application internals or employee lookup data

### Requirement: Authenticated users can change their password from the product shell
The system SHALL expose Clerk account-management UI from the shell and delegate credential updates, verification and supported session-revocation options to Clerk. The application SHALL NOT implement a parallel password mutation or trust a submitted account identity.

#### Scenario: User manages credentials
- **WHEN** an authenticated user opens account management
- **THEN** Clerk manages changes for the authenticated identity using its configured security requirements
- **AND** business screens remain in the existing product shell

### Requirement: Public credential forms keep secrets out of the browser URL
The system SHALL use supported Clerk credential transports and SHALL NOT serialize passwords, recovery credentials or secret keys into application URLs, logs or audit payloads.

#### Scenario: Credential submission
- **WHEN** a user submits a password-bearing authentication operation
- **THEN** credential values do not appear in the browser query string or application logs

### Requirement: Logout ends authenticated access
The system SHALL sign out through Clerk, clear the domain-session projection and all protected caches, and require fresh authentication for protected access. Expiration, user changes and organization changes SHALL invalidate previous-context data, including late in-flight responses.

#### Scenario: User logs out
- **WHEN** an authenticated user signs out
- **THEN** Clerk ends the selected session and protected cached data is cleared before returning to login

#### Scenario: Organization changes during a request
- **WHEN** an old organization's data request completes after switching the active organization
- **THEN** its response cannot populate or render in the new organization's protected context

### Requirement: Public authentication screens use the shared product UI language
The system SHALL use Clerk prebuilt authentication/account widgets with pt-BR localization inside feature-owned components and existing public/product layouts. Clerk widgets SHALL be an explicit provider-UI exception; surrounding application UI SHALL continue using shared UI exports.

#### Scenario: Provider authentication UI is rendered
- **WHEN** a user opens login, recovery or account management
- **THEN** Clerk owns the credential interaction and surrounding layout follows the documented feature and shared UI boundaries

## ADDED Requirements

### Requirement: Authentication policy is managed in Clerk
The system SHALL configure credentials, session lifetime, enumeration/attack protection and pending-session tasks in Clerk using supported settings. It SHALL remove legacy controls that imply unsupported duration or temporary-password behavior and update canonical contracts to the effective provider policy.

#### Scenario: Session settings are configured
- **WHEN** an operator configures the Clerk instance for deployment
- **THEN** effective session/security settings and required plan capabilities are documented and verified without recreating a separate app session mechanism

#### Scenario: Uninvited identity signs in
- **WHEN** a Clerk identity lacks an authorized firm membership or Employee mapping
- **THEN** authentication alone does not grant access to product data or self-service firm creation
