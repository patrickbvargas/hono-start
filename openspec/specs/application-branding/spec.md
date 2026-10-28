# Spec: application-branding

## Purpose

Define global Clerk application identity, independent fallbacks and stable sidebar loading geometry.

## Requirements

### Requirement: Global application identity
The app SHALL use Clerk application name and logo globally, independent of active Organization, and SHALL preserve each page label in browser titles.

#### Scenario: Configured branding
- **WHEN** Clerk returns application name Legal and a valid logo
- **THEN** sidebar uses Legal and that logo, and Clientes browser title is Clientes | Legal
- **AND** public login title uses Entrar | Legal

#### Scenario: Organization switch
- **WHEN** the user changes active Organization
- **THEN** application branding remains tied to the same Clerk application

### Requirement: Independent fallbacks
The app SHALL validate branding fields independently and SHALL use Hono for missing/invalid names, name initials for missing/broken logos, and /favicon.ico for missing/invalid/broken favicons.

#### Scenario: Partial invalid branding
- **WHEN** application name is blank and logo is invalid but favicon is valid
- **THEN** name becomes Hono and logo becomes initials while configured favicon remains usable

#### Scenario: Image failure
- **WHEN** remote logo or favicon cannot load
- **THEN** its corresponding fallback is displayed

#### Scenario: First load unavailable
- **WHEN** Clerk branding cannot be fetched and no cached result exists
- **THEN** the app remains usable with local defaults

### Requirement: Refresh and safe retrieval
The app SHALL refresh branding on window focus and reconnect, retain cached successful branding on request failure, and fetch only its configured Clerk instance without user credentials.

#### Scenario: Branding edited in Dashboard
- **WHEN** the user returns to the window after a Dashboard branding update
- **THEN** sidebar, browser title and favicon reflect the next successful result

#### Scenario: Refresh fails
- **WHEN** a branding refresh fails after a successful load
- **THEN** last successful branding remains visible

#### Scenario: Credential isolation
- **WHEN** public branding is requested
- **THEN** retrieval targets only configured Clerk instance without browser cookies or secret credentials

### Requirement: Stable header loading geometry
The OrganizationSwitcher loading fallback and loaded trigger SHALL reserve the same vertical space in the sidebar header.

#### Scenario: Organization selector finishes loading
- **WHEN** the loading fallback is replaced by the interactive Organization selector
- **THEN** the header text and logo do not shift vertically
