## 1. Schema and environment preparation

- [x] 1.1 Add Supabase Auth environment variables to the validated env layer and remove Better Auth-only runtime requirements that are no longer needed.
- [x] 1.2 Create the Prisma migration that adds `supabaseAuthUserId`, `isAccessEnabled`, and `mustChangePassword` to `Employee` and update generated Prisma types.
- [x] 1.3 Update seed and bootstrap data so development employees can be linked to or recreated in Supabase Auth.

## 2. Supabase auth infrastructure

- [x] 2.1 Add the Supabase Auth browser, server, and admin client modules using repository-safe configuration boundaries.
- [x] 2.2 Replace the shared auth runtime surface so authentication flows depend on Supabase-native operations instead of Better Auth APIs.
- [x] 2.3 Remove Better Auth-specific dependency wiring from shared auth modules once Supabase clients are in place.

## 3. Shared session and route enforcement

- [x] 3.1 Rework server-side session resolution in `src/shared/session` to map the current Supabase session to the linked employee domain actor.
- [x] 3.2 Enforce `isAccessEnabled`, `isActive`, and `deletedAt` checks during protected session resolution and fail safely when the employee linkage is invalid.
- [x] 3.3 Update frontend session query and route-guard wiring so protected and public auth routes use one synchronized Supabase-backed session source.

## 4. Authentication feature migration

- [x] 4.1 Replace login flow internals with Supabase Auth sign-in while preserving email-or-OAB input, safe pt-BR errors, and post-login protected-query invalidation.
- [x] 4.2 Replace logout flow internals with Supabase Auth sign-out while preserving protected-query cache clearing and redirect behavior.
- [x] 4.3 Replace password reset request and reset completion flows with Supabase-native recovery operations and preserve non-enumerating feedback.
- [x] 4.4 Replace authenticated password change and forced password change flows with Supabase-native password updates plus employee access-flag orchestration.
- [ ] 4.5 Rework auth-focused tests to assert documented behavior instead of Better Auth-specific method calls or table shapes.

## 5. Employee access lifecycle migration

- [x] 5.1 Reimplement collaborator access grant to create or reactivate Supabase Auth users, set employee access flags, generate temporary passwords, and avoid leaking plaintext passwords to audit payloads.
- [x] 5.2 Reimplement collaborator access revoke to disable employee access, revoke Supabase-backed sessions, and preserve the auth identity for later re-enable.
- [x] 5.3 Reimplement collaborator password reset to update the Supabase credential, revoke existing sessions, and require password change on next login.
- [x] 5.4 Update employee-management tests to validate the Supabase-backed access lifecycle and domain-owned flags.

## 6. Legacy removal and verification

- [ ] 6.1 Remove Better Auth dependencies, runtime code paths, and dead schema references after Supabase flows pass locally.
- [x] 6.2 Review docs touched by the implementation contract, especially architecture and data-access references that still name Better Auth.
- [x] 6.3 Run `pnpm check` and `npx tsc --noEmit`, fix any issues, and verify the OpenSpec change is ready for `/opsx:apply`.
