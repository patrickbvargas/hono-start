## Project Documentation — Table of Contents

`docs/` is the canonical project contract. Domain docs define business truth. Implementation docs define how to build.

**Read domain docs to understand the product. Read implementation docs when writing code.**

---

## Domain (`docs/domain/`)

| File | What it defines | What it does NOT cover |
|---|---|---|
| [DOMAIN_MODEL.md](docs/domain/DOMAIN_MODEL.md) | All entities, their fields, 4 Bounded Contexts (Identity, Operational, Bridge, Financial), transversal entities (Attachment, AuditLog), derived status rules | Business invariants (see BUSINESS_RULES.md), UML diagrams (see FINANCIAL_UML.md) |
| [FINANCIAL_UML.md](docs/domain/FINANCIAL_UML.md) | Mermaid diagrams: bounded-context flow, full class diagram with fields, lookup catalog diagram, decoupled-architecture invariants | Narrative rules (see DOMAIN_MODEL.md, FINANCIAL_SYSTEM.md) |
| [FINANCIAL_SYSTEM.md](docs/domain/FINANCIAL_SYSTEM.md) | Financial engine contract: principles, bridge handoff, settlement equation C=P−D+J+M, atomic multi-settlement, remuneration engine, reversals, reporting dimensions | Entity field definitions (see DOMAIN_MODEL.md) |
| [BUSINESS_RULES.md](docs/domain/BUSINESS_RULES.md) | Enforced invariants: identity/profile rules, contract composition, bridge closure lock, settlement equation constraints, remuneration trigger rules, multitenancy isolation | Flows and UX (see USER_FLOWS.md) |
| [USER_FLOWS.md](docs/domain/USER_FLOWS.md) | End-to-end user workflows: person registration, contracts, financial settlement generation, expenses, manual entries, receipts/payments, reversals | Business invariants (see BUSINESS_RULES.md) |
| [ROLES_AND_PERMISSIONS.md](docs/domain/ROLES_AND_PERMISSIONS.md) | Admin vs Member permission matrix per module, visibility and secrecy rules for remuneration | Auth implementation (see implementation/SECURITY.md) |
| [MULTITENANCY.md](docs/domain/MULTITENANCY.md) | Entity scope matrix (global vs Firm-scoped), isolation principles, Clerk org-switch behavior | Technical enforcement (see implementation/SECURITY.md) |
| [LOOKUP_VALUES.md](docs/domain/LOOKUP_VALUES.md) | All `ref_*` catalog tables, physical table names, canonical enum values and labels | Lookup persistence rules (see implementation/DATA_ACCESS.md) |

---

## Implementation (`docs/implementation/`)

| File | What it defines | What it does NOT cover |
|---|---|---|
| [ARCHITECTURE.md](docs/implementation/ARCHITECTURE.md) | Fixed stack (TanStack Start/Router/Query/Form/Table, Prisma, Clerk, shadcn/ui, Zod, Biome, Vitest), canonical folder shape, feature slice pattern, dependency direction, public barrel rules | UI patterns (see FRONTEND_*.md), coding conventions (see CONVENTIONS.md) |
| [CONVENTIONS.md](docs/implementation/CONVENTIONS.md) | Naming (kebab-case files, PascalCase components, camelCase hooks), TypeScript rules, Zod rules, export rules, feature boundary rules, cache/mutation rules, form hook rule | Architecture shape (see ARCHITECTURE.md) |
| [DATA_ACCESS.md](docs/implementation/DATA_ACCESS.md) | Prisma usage, identifier strategy, timestamp strategy, soft delete/restore semantics, query shape rules, lookup strategy, financial precision, Prisma migration workflow, seed contract, audit persistence | Business entity semantics (see domain/), UI patterns |
| [SECURITY.md](docs/implementation/SECURITY.md) | Trust boundaries, server-side authorization enforcement, tenant isolation, session policy shape (schema/server/client/access modules), sensitive data rules, Clerk enforcement, attachment storage access | Role/permission matrix (see domain/ROLES_AND_PERMISSIONS.md) |
| [ATTACHMENTS.md](docs/implementation/ATTACHMENTS.md) | Private Supabase Storage configuration, upload/delivery/deletion transport rules, owner authorization, batch locking, compensation on failure | Attachment domain model (see domain/DOMAIN_MODEL.md § Entidades Transversais) |
| [FRONTEND_LAYOUT.md](docs/implementation/FRONTEND_LAYOUT.md) | Route model, layout composition (Wrapper/WrapperHeader/WrapperBody), overlay system (useOverlay/useEntityOverlay), navigation, loading/empty states, shadcn/ui rules, Clerk identity UI, application theme | Form rules (see FRONTEND_FORMS.md), table/list rules (see FRONTEND_TABLES.md) |
| [FRONTEND_FORMS.md](docs/implementation/FRONTEND_FORMS.md) | EntityForm pattern, form section rules, numeric/date input rules, feature form hook pattern, option query rules, data hook rules (use-data.ts), imperative query execution | Layout rules (see FRONTEND_LAYOUT.md), table rules (see FRONTEND_TABLES.md) |
| [FRONTEND_TABLES.md](docs/implementation/FRONTEND_TABLES.md) | Table/list composition, columns.tsx factory, scroll rules, TanStack Table integration, DataTable pagination and sorting modes, drilldown feature contract, read-only column factories, RelatedRecordLink | Form rules (see FRONTEND_FORMS.md), layout rules (see FRONTEND_LAYOUT.md) |
| [QUALITY_WORKFLOW.md](docs/implementation/QUALITY_WORKFLOW.md) | Feature implementation sequence, ownership rule, validation boundary, error handling, transaction rules, testing rule (Vitest), commit message convention (Conventional Commits), contributor checklist, definition of done, review rubric | Architecture shape (see ARCHITECTURE.md), coding conventions (see CONVENTIONS.md) |

---

## Contract Rules

- Domain docs define business truth. If code disagrees with domain docs, docs win.
- Implementation docs define how to build. If a pattern is undocumented, preserve the existing documented shape — do not invent.
- Docs are the reference target; code is being refactored to match them.
- Do not swap documented stack, folder structure, hook patterns, or import boundaries without updating the contract first.

---

## shadcn/ui

- Import UI only from `@/shared/components/ui` in routes and features.
- Do not import shadcn, Radix, Base UI, or other vendor UI primitives directly from routes or features.
- `src/shared/components/Hui` is a temporary migration compatibility layer only; do not add new imports from it.

---

## Personal Coding Pattern

Mirror the user's code shape, not generic best practice.

### Frontend Data Contract
- Zod as boundary between API and frontend. Validate server payloads with explicit schemas close to the feature.

### Async State
- TanStack Query for server-state cache. Centralized stable query keys. Feature-owned query hooks.

### Component Shape
- Separate concerns by file. Logic in hooks, rendering in components. One concern per file.

### Logic Hooks
- `useController`-style hooks for orchestration. Feature hooks: `use-form.ts`, `use-data.ts`, `use-delete.ts`, `use-restore.ts`.

### Forms
- `react-hook-form` + `useController` in user-owned legacy modules. TanStack Form for new repository work per ARCHITECTURE.md. Do not silently swap.

### Local State
- Zustand for cross-component filter state and screen coordination. Not a generic dump.

### Tables
- TanStack Table. Use `table-base.tsx` when present. Declarative column definitions colocated with feature.
