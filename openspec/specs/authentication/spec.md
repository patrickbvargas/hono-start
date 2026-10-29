# authentication Specification

## Purpose
Define the authentication feature contract for Clerk-owned credential flows, protected session gating, recovery, account management, configured session policy, and logout behavior.
## Requirements

### Requirement: Public authentication routes exist outside the authenticated shell
The system SHALL expose `/login` and a compatible `/recuperar-senha` entry outside the authenticated shell under `_auth`. Authentication routes SHALL render Clerk-supported sign-in/recovery behavior within feature-owned presentation, with pt-BR localization and any required catch-all paths for provider navigation.

#### Scenario: User opens authentication routes
- **WHEN** an unauthenticated user opens login or recovery
- **THEN** the Clerk authentication experience renders without the product sidebar or a prior product session

#### Scenario: Unauthenticated user opens login route
- **WHEN** an unauthenticated user navigates to `/login`
- **THEN** the system renders the login screen inside the `_auth` public container
- **AND** the authenticated product sidebar is not rendered

#### Scenario: Unauthenticated user opens password-reset route
- **WHEN** an unauthenticated user navigates to `/recuperar-senha`
- **THEN** the system renders the password-reset flow inside the `_auth` public container
- **AND** no prior authenticated session is required

### Requirement: Protected routes require authenticated session
The system SHALL gate `_app` in `beforeLoad` using a verified active Clerk session, completed session tasks, current organization membership and a valid domain actor mapping. ClerkProvider SHALL own provider state; the shared session query SHALL only project the domain actor and safe capabilities.

#### Scenario: Missing or pending session
- **WHEN** a signed-out user or a user with incomplete Clerk session tasks enters a protected route
- **THEN** protected loaders and product content do not continue
- **AND** the user is directed to the appropriate Clerk authentication/task flow

#### Scenario: Authenticated user revisits login
- **WHEN** a fully authenticated, mapped user visits login
- **THEN** users with multiple Organization memberships see the native Organization selector even if a previous Organization is active
- **AND** users with a single membership continue to the safe requested destination or authenticated home

#### Scenario: Unauthenticated user hits protected route
- **WHEN** an unauthenticated user navigates to `/clientes`
- **THEN** the `_app` authenticated layout blocks access before rendering the child route
- **AND** the system redirects the user to `/login`

#### Scenario: Authenticated child route does not use stale unauthenticated browser session state
- **WHEN** a user has completed login successfully and enters a protected child route inside the authenticated shell
- **THEN** the child route reads the synchronized frontend authenticated-session source
- **AND** it does not fail because a separate optional browser session cache still holds an unauthenticated result

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

#### Scenario: Logged-out user revisits protected page
- **WHEN** the user tries to open a protected route after logout
- **THEN** the system requires a new authenticated session

#### Scenario: Expired protected session clears browser-side authenticated state
- **WHEN** a protected session can no longer be resolved by the required authenticated-session path
- **THEN** the system clears the shared frontend session query
- **AND** redirects the user to `/login`

### Requirement: Public authentication screens use the shared product UI language
The system SHALL use Clerk prebuilt authentication/account widgets with pt-BR localization inside feature-owned components and existing public/product layouts. Clerk widgets SHALL be an explicit provider-UI exception; surrounding application UI SHALL continue using shared UI exports.

#### Scenario: Provider authentication UI is rendered
- **WHEN** a user opens login, recovery or account management
- **THEN** Clerk owns the credential interaction and surrounding layout follows the documented feature and shared UI boundaries

### Requirement: Authentication route guards execute before route loading
The system SHALL enforce public-auth and protected-app route redirects in TanStack Router `beforeLoad` handlers instead of route `loader` functions. When an unauthenticated actor is redirected away from a protected route, the system MUST preserve the originally requested internal destination so the post-login flow can resume there safely.

#### Scenario: Unauthenticated user is redirected before protected route loading
- **WHEN** an unauthenticated user navigates to a protected route such as `/clientes`
- **THEN** the protected `_app` route redirects in `beforeLoad`
- **AND** the protected route loader does not act as the primary authentication gate

#### Scenario: Requested protected destination is preserved
- **WHEN** an unauthenticated user is redirected from a protected route to `/login`
- **THEN** the redirect payload includes the originally requested internal destination
- **AND** the login flow can navigate back to that destination after successful authentication

#### Scenario: Authenticated user is redirected away from public auth routes before loading
- **WHEN** an authenticated user navigates to `/login` or `/recuperar-senha`
- **THEN** the public auth route redirects in `beforeLoad`
- **AND** the public route loader does not act as the primary authenticated-user gate

#### Scenario: Unsafe redirect destinations are ignored
- **WHEN** the login flow receives a redirect destination that is missing, malformed, or not an internal route
- **THEN** the system ignores that destination
- **AND** the post-login flow navigates to the default authenticated entry route

### Requirement: Authentication policy is managed in Clerk
The system SHALL configure credentials, session lifetime, enumeration/attack protection and pending-session tasks in Clerk using supported settings. It SHALL remove legacy controls that imply unsupported duration or temporary-password behavior and update canonical contracts to the effective provider policy.

#### Scenario: Session settings are configured
- **WHEN** an operator configures the Clerk instance for deployment
- **THEN** effective session/security settings and required plan capabilities are documented and verified without recreating a separate app session mechanism

#### Scenario: Uninvited identity signs in
- **WHEN** a Clerk identity lacks an authorized firm membership or Employee mapping
- **THEN** authentication alone does not grant access to product data or self-service firm creation

### Requirement: Clerk control feedback and task recovery
Authentication surfaces SHALL show loading feedback, SDK initialization failure with reload, and a nonblocking degraded-service notice. Loaded content SHALL remain available in degraded mode subject to server authorization. Show SHALL control signed-in/signed-out presentation only; business permissions SHALL remain server-backed. Interrupted pending tasks SHALL use configured login hash task routes and preserve a validated return destination without redirecting repeatedly while already on a task.

#### Scenario: SDK initialization fails
- **WHEN** Clerk fails to initialize
- **THEN** the user sees an access-service failure and reload action instead of blank content

#### Scenario: Degraded provider
- **WHEN** Clerk loads in degraded mode
- **THEN** affected authentication surfaces show a service notice alongside loaded content without granting protected access

#### Scenario: Pending task resumes
- **WHEN** a pending session has an unfinished task
- **THEN** the user resumes its configured /login#/tasks/<key> flow and the completed flow returns through organization selection

### Requirement: Post-login Organization selection
The system SHALL determine the current authenticated user's membership count on the server. Multiple memberships SHALL require selection on login even when route revalidation happens before Clerk's post-sign-in redirect. The selector SHALL preserve the safe intended product destination and recheck normal access after selection. Provider failures SHALL NOT silently skip selection. Explicit post-login selection SHALL precede configuration recovery for the previous unit without granting product access.

#### Scenario: Session becomes ready before redirect parameters arrive
- **WHEN** login is revalidated after authentication with multiple memberships and no selection flag yet
- **THEN** the selector remains visible rather than redirecting directly to the product

#### Scenario: Organization selected
- **WHEN** the user selects an Organization
- **THEN** navigation continues directly to the safe intended product destination and validates the chosen unit without returning to the login gate

#### Scenario: Previous unit has invalid configuration
- **WHEN** a user with multiple memberships enters the explicit post-login choice with an invalid previous unit mapping
- **THEN** the user can choose another Organization but cannot access protected data without valid current mappings
