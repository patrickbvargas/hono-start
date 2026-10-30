## shadcn/ui Project Guidance

This project uses shadcn/ui through the shared UI layer.

- Import reusable UI only from `@/shared/components/ui` in routes and features.
- Do not import shadcn, Radix, Base UI, or other vendor UI primitives directly from routes or features.
- Shared UI generated components and local shared composites live under `src/shared/components/ui`.
- `src/shared/components/Hui` is a temporary migration compatibility layer only; do not add new imports from it.
- Before shadcn/ui-specific work, read the relevant project docs in `docs/implementation/` and prefer the existing shared UI export shape.

## Project Implementation Contract

This repository uses `docs/` as the canonical project contract.

Read in this order before making substantial changes:

1. `docs/index.md`
2. `docs/domain/DOMAIN_MODEL.md`
3. `docs/domain/FINANCIAL_UML.md`
4. `docs/domain/FINANCIAL_SYSTEM.md`
5. `docs/domain/USER_FLOWS.md`
6. `docs/domain/BUSINESS_RULES.md`
7. `docs/domain/ROLES_AND_PERMISSIONS.md`
8. `docs/domain/MULTITENANCY.md`
9. `docs/domain/LOOKUP_VALUES.md`
10. `docs/implementation/ARCHITECTURE.md`
11. `docs/implementation/DATA_ACCESS.md`
12. `docs/implementation/FRONTEND.md`
13. `docs/implementation/SECURITY.md`
14. `docs/implementation/ATTACHMENTS.md`
15. `docs/implementation/CONVENTIONS.md`
16. `docs/implementation/QUALITY_WORKFLOW.md`

### Contract Rules

- Domain docs define business truth and expected behavior.
- Implementation docs define stack, structure, naming, and coding rules for this repository.
- If code disagrees with docs, docs describe intended truth.
- If a pattern is undocumented, preserve the existing documented project shape instead of inventing a new one.
- Contributors must not swap the documented stack, folder structure, hook patterns, or import boundaries without updating the contract first.

## Personal Coding Pattern

This section captures the user's personal implementation style and should be
treated as a working pattern to replicate when contributing together.

### Source Of Truth For This Pattern

- Primary source is the user's code shape, not agent preference.
- In this workspace, the referenced legacy folders under
  `src/telas_atualizadas/` were not present at capture time, so this section is
  based on:
  - explicit user instructions in chat
  - compatible patterns already visible in current repository code
- If the referenced legacy files are added later, re-read them and refine this
  section to match the user's code more precisely.

### User Style Rules

- Do not invent architecture or abstractions that are not already present in
  the user's code.
- First learn how the user solved similar problem, then mirror same shape.
- Prefer consistency with the user's local pattern over generic "best practice"
  rewrites.
- When multiple developers use different styles, assume this section describes
  the style to follow for work owned by this user.

### Frontend Data Contract

- Use Zod as boundary between API return and frontend consumption.
- Validate server payloads and derived frontend models with explicit schemas.
- Keep schema close to feature and use it as contract, not loose TypeScript-only
  typing.

### Async State And Cache

- Use TanStack Query for server-state cache and invalidation.
- Keep query keys centralized and stable.
- Prefer feature-owned query hooks/boundaries instead of ad hoc fetching inside
  render components.

### Component And Folder Shape

- Separate concerns by context/file instead of collapsing many responsibilities
  into one component file.
- When component has its own local context, each folder may expose its
  implementation through `index.tsx`.
- Keep logic and rendering separated.

### Logic Hooks

- Use `useController`-style hooks for component logic/orchestration when working
  in the user's established pattern.
- UI component should stay focused on composition/render, while hook owns state,
  side effects, handlers, and transformations.
- In this repository's current house style, equivalent orchestration may appear
  in feature hooks such as `use-form.ts`, `use-data.ts`, `use-delete.ts`, and
  `use-restore.ts`. Preserve existing repo contract where required, but keep the
  same separation-of-concerns intent.

### Forms

- Use `react-hook-form` for forms when working in code that follows the user's
  personal pattern.
- Use `useController` for field or form logic ownership where that pattern is
  already established.
- Keep form validation contract explicit and schema-driven.

### Local State

- Use Zustand for cross-component filter state and related local UI state when
  that concern is not best represented by route search params or form state.
- Keep store focused on filters and screen coordination data; do not turn it
  into generic dumping ground.

### Tables

- Use TanStack Table for tables.
- When project already provides `table-base.tsx`, use it as base abstraction
  instead of building new table stack.
- Keep table definitions declarative and colocated with screen/feature logic.

### Compatibility Note For This Repository

- Current repository contract documents TanStack Form as house pattern for new
  feature work. User's personal legacy pattern mentions `react-hook-form` plus
  `useController`.
- Do not silently swap one stack for another.
- When changing existing repository slices, follow repository contract first and
  preserve local consistency.
- When working in user-owned legacy modules that already use
  `react-hook-form`, `useController`, Zustand, and `table-base.tsx`, preserve
  that pattern unless user asks for migration.
