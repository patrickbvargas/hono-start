## 1. Contract and configuration

- [x] 1.1 Consult current Context7 documentation for the server endpoint framework before implementation and inspect established route/session boundaries.
- [x] 1.2 Update canonical architecture, storage/security and deployment docs for local persistence, PC setup, backups and future Docker volumes; reconcile legacy soft-delete spec wording with permanent deletion.
- [x] 1.3 Add validated absolute ATTACHMENTS_DIR configuration, remove attachment Supabase configuration requirements and update environment examples and ignore rules. No database migration or test-data cleanup is required.

## 2. Local persistence

- [x] 2.1 Replace Supabase operations in the existing storage module with private filesystem writes, reads and deletion, preserving relative generated identities and preventing traversal/symlink escape.
- [x] 2.2 Preserve mutation compensation and auditing; map capacity, permission and missing-file failures to documented safe behavior.

## 3. File delivery

- [x] 3.1 Implement feature-owned attachment file lookup and current-session, firm and owner authorization; expose through a thin server endpoint using attachment ID.
- [x] 3.2 Replace signed URLs in query results with protected application URLs and align frontend schemas/consumers; set safe content headers and private/no-store caching on delivery.

## 4. Verification

- [x] 4.1 Add focused Vitest coverage for local upload/read/delete, relocation, traversal/symlink rejection, capacity/permission failures and compensation.
- [x] 4.2 Cover unauthenticated, cross-firm and forbidden-owner delivery, missing binaries, deletion failures and operation without Supabase credentials.
- [x] 4.3 Run relevant tests, review style/import boundaries, then run pnpm check and npx tsc --noEmit; fix failures before completion.
- [ ] 4.4 Manually verify upload/open/delete through the authenticated UI on the PC. Automated local filesystem lifecycle tests pass; operator setup and future volume transition are documented. Supabase test data remains untouched.
