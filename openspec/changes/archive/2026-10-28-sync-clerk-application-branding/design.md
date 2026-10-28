## Context

Sidebar owns an existing GET server function for public Clerk /v1/environment. Route heads format static Hono titles. Clerk authentication widgets already use Dashboard branding. Public assets include /favicon.ico.

## Goals / Non-Goals

Goals: consistent name/logo/favicon across public and protected screens, independent field fallbacks, safe refresh, unchanged business authorization.
Non-goals: theme changes, Organization identity, database writes or Dashboard configuration.

## Decisions

- Move branding query/schema into a dedicated application-branding feature, consumed through its public barrel by sidebar and root document. Keep TanStack Query and Zod; no duplicate fetching stack.
- Preserve server-side Frontend API fetching with host derived exclusively from configured publishable key. Never accept a request-controlled target or forward cookies. Use the public key for a stable global query key; no secrets enter browser bundles.
- Parse a valid environment envelope, tolerate invalid individual name/logo/favicon values independently, allow only HTTP(S) image URLs. Missing name becomes Hono; missing logo becomes existing initials; missing favicon becomes /favicon.ico. Fetch failures remain query errors so successful cache survives.
- Keep HeadContent for router-managed assets. Routes declare page labels in typed staticData; a dedicated feature head component renders the single title and favicon from current matches and branding. This replaces static per-route title declarations to avoid duplicate titles, global mutable configuration and direct document mutation. The initial server/client render uses Hono until branding resolves; no new blocking network dependency is added to navigation.
- Probe remote favicon images with a bounded load check before replacing local icon; broken assets keep local fallback. Existing shared Avatar handles broken logos. Clerk login widgets retain their native Dashboard branding.
- Revalidate on focus/reconnect and retain last successful query result on failures. No persistent browser storage or database copy.
- Browser feedback: the OrganizationSwitcher fallback used a 16px line box while Clerk rendered an 18px trigger. Fix both states at 18px, including root and identifier line height. Browser measurement confirmed loaded trigger/root at 18px. This is a CSS geometry correction, verified visually rather than with a class-name assertion test.
- Context7 Clerk and TanStack Router docs were consulted; installed router sources confirm staticData/useMatches and standard HeadContent behavior.

## Risks / Trade-offs

- Provider outage → local defaults initially; last successful in-memory data on refresh failure.
- Favicon browser caching → URL updates are reflected; same-URL changes follow normal HTTP cache policy.
- Public environment payload drift → Zod envelope validation, field-level fallback and regression tests. Confirmed all three wire fields with an HTTP 200 response from the configured public Clerk /v1/environment endpoint.
- SSR uses fallback branding until client data loads → deterministic hydration, no new blocking provider call.

## Migration Plan

No DB migration or new dependencies. Deploy application files together; rollback restores previous sidebar query and static titles. Update frontend contract with new ownership.

## Open Questions

None.

## Verification

- pnpm check and npx tsc --noEmit passed.
- Focused branding, sidebar, real-router head and architecture/convention tests: 50 passed.
- Production build passed (dependency bundler directive warnings only).
- Built /login response: HTTP 200, one Entrar | Hono title and /favicon.ico fallback.
- Public configured Clerk environment: HTTP 200; all three branding wire fields present.
- Browser measurement: loaded OrganizationSwitcher trigger/root both 18px; loading fallback explicitly reserves the same 18px box.
- Attachment storage tests: 12 passed with host filesystem permissions after restricted hard-link failures.
- Complete suite with host filesystem permissions: 215 files / 1091 tests passed; one unrelated related-records context-menu test exceeded its existing 5000ms timeout under suite load. Its isolated repeat passed all 8 tests; no timeout or implementation changes were made to that feature.
