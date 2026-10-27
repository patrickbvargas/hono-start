## Implementation

- [x] Keep original master entities, remove firmId and profile/membership layers; preserve seed Firm 2 POA.
- [x] Adapt global reads/writes/selectors and Clerk identity while keeping operations and financial aggregates branch scoped.
- [x] Share master attachments, owner capacity locks and audit visibility; retain origin firm and operational authorization.
- [x] Restore ordinary frontend without link actions or notices and update canonical documentation.
- [x] Verify migration backfill/rollback, focused security regressions, TypeScript, formatting, full tests and production build.

- [x] Seed a smaller POA operation with shared master IDs, separate financial/evidence examples and regression coverage for reset demonstrations.
- [x] Centralize multitenancy documentation, reconcile obsolete Firm-owned master wording, synchronize main specs and archive the completed change.
