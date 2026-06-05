## 1. Auth Access Model

- [x] 1.1 Confirm the current Supabase Auth admin APIs for ban/unban and session revocation in the installed SDK version and document the chosen integration points in the feature code.
- [x] 1.2 Refactor employee access mutations to unban on grant, ban on revoke, and keep admin password reset revoking active sessions through the canonical Supabase Auth flow.
- [x] 1.3 Refactor the login flow to rely on Supabase Auth ban state plus active/non-deleted employee linkage checks, with safe pt-BR handling for revoked-access feedback.

## 2. Data Model And Seed

- [x] 2.1 Remove or downgrade `employees.isAccessEnabled` from the Prisma schema and add any required migration to preserve current collaborator access state during the transition.
- [x] 2.2 Update seed and employee/auth reconciliation so seeded collaborators and auth users reflect the new provider-native access-control lifecycle.
- [x] 2.3 Regenerate the Prisma client and align employee query/model contracts with the updated schema.

## 3. UI And Query Contracts

- [x] 3.1 Update employee details access UI and related view models so grant/revoke status is derived from linked auth account state instead of an application access flag.
- [x] 3.2 Remove any remaining feature logic, copy, or conditions that depend on `isAccessEnabled` as the source of truth for credential access.

## 4. Verification

- [x] 4.1 Add or update focused Vitest coverage for authentication login, employee grant/revoke, and admin password reset with the new ban/unban semantics.
- [x] 4.2 Run `pnpm check`, `npx tsc --noEmit`, relevant Vitest coverage, and the closest feasible database reset/seed verification before marking the change complete.
