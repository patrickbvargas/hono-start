# Feature Behavior

This document defines the product surface and the expected behavior of each feature area.

It is intentionally about behavior, not field-by-field data contracts or low-level business rules.

- Entity meaning lives in `DOMAIN_MODEL.md`.
- Hard business constraints live in `BUSINESS_RULES.md`.
- Permissions live in `ROLES_AND_PERMISSIONS.md`.
- Filtering and sorting semantics live in `QUERY_BEHAVIOR.md`.
- Step-by-step flows live in `USER_FLOWS.md`.

## Product Surface

The software core includes these feature areas:

- Authentication and session management
- Dashboard
- Clients
- Employees / collaborators
- Contracts
- Revenues
- Fees
- Remunerations
- Attachments
- Audit log
- Export

## Feature Area Intent

### Authentication And Session Management

- Provides login with email or OAB number plus password.
- Provides password-reset entry and recovery behavior.
- Protects authenticated areas of the application.
- Establishes the authoritative session context for tenant and role decisions.

### Dashboard

- Serves as the default authenticated landing area.
- Summarizes operational and financial information relevant to the current user.
- Surfaces recent business activity and high-level comparisons.
- Adapts scope according to the role and visibility model.

### Clients

- Provides the main client list and client-management entrypoint.
- Supports search, filtering, create, edit, detail, delete, and restore flows according to permissions.
- Preserves list context while viewing or editing a specific client.
- Acts as an upstream dependency for contract creation.

### Employees / Collaborators

- Provides administrative employee-account management.
- Supports role, employee-type, and remuneration-related configuration.
- Allows authenticated users to see only the profile context they are allowed to access.
- Supplies collaborator options to contract-team workflows.

### Contracts

- Acts as the main operational aggregate for legal work.
- Brings together client, legal area, team composition, revenue planning, and lifecycle state.
- Exposes writable behavior while the contract remains in a writable state.
- Becomes read-only when business status rules require it.

### Revenues

- Represents payment plans attached to contracts.
- Shows expected incoming value, payment structure, and payment progress.
- Exists inside the contract context rather than as a standalone business area.

### Fees

- Records concrete payment events against revenues.
- Updates payment progress and downstream financial state.
- Optionally triggers remuneration generation.

### Remunerations

- Provides the payout-review surface derived from fee events.
- Exposes user-scoped or firm-scoped visibility depending on role.
- Allows administrative correction where the role model permits it.

### Attachments

- Provides file handling for client, employee, and contract contexts.
- Supports upload and view behavior within allowed contexts.
- Keeps deletion behavior restricted according to permissions.

### Audit Log

- Provides immutable administrative review of business mutations.
- Exists as a review surface, not as editable operational data.

### Export

- Produces filtered report output for supported financial datasets.
- Preserves the same scope restrictions applied in on-screen views.

## Route Inventory

### Public Routes

- `/login`
- `/recuperar-senha`

### Authenticated Product Routes

- `/`
- `/clientes`
- `/colaboradores`
- `/contratos`
- `/honorarios`
- `/remuneracoes`
- `/configuracoes`
- `/suporte`

## Canonical Screen Behavior

- Dashboard is the default authenticated landing page.
- Entity list screens are the primary operational entrypoints.
- Entity details open without losing list context.
- Create and edit flows happen as overlays rather than dedicated CRUD pages.
- Administrative actions appear only when the session allows them.
- Read-only business states must block writes consistently across all affected surfaces.
- The application is desktop-first with responsive support for smaller devices.

## Feature-Level Expectations

### Dashboard Expectations

- Shows revenue totals and remuneration totals.
- Shows recent business activity.
- Shows monthly comparison information.
- Shows the last 10 recent events across supported business entity types.
- Shows firm-wide data for administrators.
- Shows scoped data for regular users.
- Includes revenue charts by legal area and revenue type.

### Client Expectations

- Users can create and update clients within policy.
- Users can search and filter clients efficiently.
- Users can inspect client details without leaving the list context.
- Client behavior supports downstream contract workflows.

### Employee Expectations

- Administrators can create and maintain employee accounts.
- Administrators can manage employee role, type, and remuneration-related settings.
- Regular users may update only their own profile context when policy allows it.

### Contract Expectations

- Users can create contracts with assigned collaborators and at least one revenue plan.
- Users can inspect contract team composition and lifecycle state.
- Administrators can control contract status-lock behavior.
- Contract behavior coordinates downstream revenue, fee, and remuneration behavior.

### Fee And Remuneration Expectations

- Users can record fees against revenues.
- Users can choose whether remuneration generation happens for a fee event.
- Administrators can manually adjust remuneration records when policy allows it.
- Remuneration review remains tied to the underlying fee and contract context.

### Attachment Expectations

- Authenticated users can upload and view attachments in supported contexts.
- Attachment deletion remains permission-controlled.

### Audit Expectations

- Administrators can inspect immutable audit history.
- Audit history exists to explain business mutations after the fact.

### Export Expectations

- Export supports remuneration, revenue, or fee data.
- Export supports PDF and spreadsheet output.
- Export supports date-range filtering.
- Export scope follows the role model.

## Canonical Use Cases

### Authentication

- As a user, I can log in with email or OAB number and password.
- As a user, I can recover access through password reset.
- As a user, I can access only authenticated areas after login.

### Client Management

- As a user, I can create a client so contracts can be linked to that record.
- As a user, I can search and filter clients to find the right party quickly.
- As a user, I can inspect client details without losing list context.

### Employee Management

- As an administrator, I can create and maintain employee accounts.
- As an administrator, I can control employee role, type, and remuneration-related fields.
- As a user, I can update only my own profile context when allowed by policy.

### Contract Management

- As a user, I can create a contract with assigned collaborators and at least one revenue plan.
- As a user, I can inspect the assigned team and contract lifecycle state.
- As an administrator, I can lock status changes on a contract.

### Fee And Remuneration

- As a user, I can record a fee and generate remunerations automatically.
- As a user, I can record a fee without remuneration generation for exceptional situations.
- As an administrator, I can manually adjust remuneration records when business reality requires it.

### Reporting And Visibility

- As a user, I can see scoped dashboard and remuneration information relevant to me.
- As an administrator, I can review firm-wide financial information.
- As an administrator or authorized user, I can export scoped operational data.

### Administration And Audit

- As an administrator, I can soft-delete and restore supported business records.
- As an administrator, I can inspect immutable audit history.
- As an authenticated user, I can upload and view attachments within allowed contexts.

## Behavioral Boundaries

- Features must preserve firm isolation.
- Features must preserve role-aware visibility.
- Entity behavior must remain aligned with canonical user flows.
- Business entities used as form options must respect active and deleted status rules.
- Lookup values may remain visible but disabled when inactive.
- This document must not become the duplicate home of entity schemas, validation rules, or permission matrices already defined elsewhere.
