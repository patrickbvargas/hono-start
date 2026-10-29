# Product Sense

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Operational roots become Contract (including Revenue/team) and Expense. Financial roots become Receivable, Receipt, Payable and Payment. Global people/catalogs and granular financial access preserve branch isolation. Future modules may generate titles; they are not in current scope.


## Purpose

Hono is an internal legal fee management system for a law firm. It replaces spreadsheet-based operational control for clients, contracts, fees, and remunerations with a multi-tenant web application.

## Target Users

- Firm administrators who manage operational and financial data.
- Lawyers and administrative assistants who need access to their contracts, fees, and remunerations.

## Product Goals

- Eliminate manual remuneration calculation errors.
- Preserve an auditable history of business changes.
- Centralize firm data in one searchable system.
- Enforce role-based visibility of financial information.
- Keep the user interface in pt-BR while the codebase remains in English.

## Non-Goals

- No client-facing portal.
- No general case-management platform.
- No external accounting or court-system integration in the current scope.
- No email or push notification workflows outside authentication needs.

## Operational Problems Being Solved

- Spreadsheet-based fee and remuneration calculation is error-prone.
- Historical business data is hard to search and audit outside a proper application.
- Sensitive financial information needs role-aware visibility rather than informal document sharing.
- The firm needs consolidated operational visibility over clients, contracts, revenues, fees, and payouts.

## Core Product Surface

The software core includes:

- authentication and session handling
- dashboard and analytics
- client management
- employee management
- contract management
- revenue tracking
- fee management
- remuneration calculation and review
- attachment handling
- audit history
- remuneration export

## Authentication Experience

- Users authenticate through Clerk email or username sign-in. OAB remains business data.
- Password reset is handled by the Clerk sign-in surface. Legacy password URLs redirect to login.
- Authenticated users manage credentials through the Clerk profile inside the product shell.
- Clerk governs protected-session lifetime and security policy.

## Product Invariants

- One company operates multiple Firms: operational and financial data are isolated per branch; clients, employees and lookup options are shared. See [Multitenancy](MULTITENANCY.md).
- The software core is legal-fee and remuneration management, not general CRM.
- Business users enter through lists and manage records in dedicated pages. Related records open in contextual drawers; create and edit remain modal forms.
- The product must remain desktop-first with basic mobile support.
- The product must preserve pt-BR labels, messages, and user feedback.
- Role-aware financial visibility is part of the product identity.
- Auditability is part of the product identity.
- Automated remuneration generation from fee events is part of the product identity.

## Allowed Product Freedom

- Internal implementation details may change.
- Minor UX polish may change.
- Technical abstractions may evolve if they still preserve the documented business rules and implementation contract.

## Forbidden Product Drift

- Do not change the domain focus away from legal fee management.
- Do not remove multi-tenant isolation.
- Do not redefine the role model without updating domain docs first.
- Do not introduce undocumented core workflows or entity semantics.
