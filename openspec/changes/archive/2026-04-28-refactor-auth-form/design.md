## Context

`src/features/authentication` already satisfies the current authentication business rules, but the slice diverges from the repository's documented frontend and feature-architecture patterns in three practical ways:

1. Presentation components are flat files instead of the leaf-folder `components/<name>/index.tsx` shape used by the other features.
2. The public authentication screens rely on a one-off visual treatment with heavy custom styling instead of the shared shadcn-based UI composition used across the product.
3. The slice naming and public-surface shape are less aligned with the canonical feature pattern, which increases maintenance cost when routes or future contributors need to follow the same house rules.

The change must preserve the current `/login` and `/recuperar-senha` behavior, including redirect rules, safe error feedback, remember-me handling, failed-login protection, and password-reset semantics. The work is localized to the authentication feature and its public routes; it does not require auth-provider, Prisma, or session-policy changes.

## Goals / Non-Goals

**Goals:**

- Bring `src/features/authentication` back to the documented feature slice shape used by the rest of the repository.
- Normalize the public auth UI so it is composed from shared UI primitives and matches the project's existing visual language more closely.
- Preserve the existing authentication logic and route behavior while refactoring structure, naming, and presentation.
- Leave focused verification behind so the refactor can be completed without silent regressions.

**Non-Goals:**

- Changing any authentication business rule, permission rule, or session policy.
- Replacing Better Auth, TanStack Start server functions, or Prisma persistence.
- Converting public auth pages into the authenticated wrapper layout or introducing a new global auth design system.

## Decisions

### Decision: Preserve the existing auth data and mutation boundaries

The refactor will keep `schemas/`, `api/`, `data/`, and the existing auth workflows as the behavioral source of truth unless a naming cleanup is required to match the documented conventions. This keeps risk concentrated in the UI and feature-organization layer instead of reopening login, logout, password-reset, or lockout logic.

Alternative considered: rewrite the auth hooks and mutation boundaries together with the UI cleanup. Rejected because the user asked for a non-breaking refactor, and the current server-side behavior already matches the domain contract.

### Decision: Reshape auth presentation into canonical leaf components

Authentication presentation components will move to the same leaf-folder shape used elsewhere in the repository, with each public component implemented at `components/<slice>/index.tsx` and re-exported only from the top-level feature barrel. Route files will continue importing from `@/features/authentication`, and internal auth modules will import concrete files directly.

Alternative considered: keep the current flat files and only restyle them. Rejected because it would leave the main structural mismatch in place.

### Decision: Use shared UI composition and remove the bespoke auth visual system

The public auth screens will keep a dedicated public-page layout, but that layout will be intentionally simple and built from shared UI primitives already exposed through `@/shared/components/ui`. The current gradient, glassmorphism, and marketing-style side panel will be removed in favor of project-consistent card, typography, spacing, links, and button treatment.

Alternative considered: preserve the current custom hero layout and only swap a few controls. Rejected because the current issue is not only control choice; the screen's overall visual language differs from the rest of the product.

### Decision: Keep form orchestration inside feature hooks and clean up naming where needed

The auth forms will continue using `useAppForm` through feature-local hooks. Naming and local interface cleanup will be applied where needed so route components stay declarative and free of persistence orchestration, consistent with the rest of the repository.

Alternative considered: push more auth submission logic into route files to simplify the forms. Rejected because it would violate the documented frontend ownership rules.

### Decision: Add focused verification around preserved auth behavior

The refactor will retain and extend focused authentication tests where structure or UI composition changes could hide regressions. Behavioral checks remain centered on login, logout, password reset, and safe failure messaging rather than snapshot-style presentation tests.

Alternative considered: rely only on manual verification because the change is "just UI". Rejected because the repository contract requires focused coverage for behavior-affecting refactors, and auth is too sensitive to leave unguarded.

## Risks / Trade-offs

- [UI parity risk] The new auth screen may remove some current visual affordances that stakeholders happen to like even though they are inconsistent. → Mitigation: optimize for repository consistency and preserve all required labels, help text, and actions.
- [Refactor spillover risk] Renaming components and folders can break route imports or barrel exports. → Mitigation: keep the top-level `src/features/authentication/index.ts` as the only public surface and verify route imports after the move.
- [Behavior regression risk] Auth forms are sensitive to submit handling, redirect timing, and safe error messages. → Mitigation: preserve hook-owned orchestration and run focused tests on the mutation and form flows.
- [Over-correction risk] Chasing perfect consistency could pull public auth pages into patterns meant only for authenticated entity management screens. → Mitigation: preserve the public-route nature of auth pages and apply only the relevant shared UI and feature-structure rules.
