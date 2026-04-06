# Hono — Legal Fee Management System

## Conventions Document

> **Version:** 1.0 — 2026

---

## Language Policy

**UI and user-facing content**: Portuguese (pt-BR) — labels, messages, validation errors, empty states, toasts

**Codebase**: English — variable names, function names, file names, comments, server logs

---

## TypeScript
 
- `any` is forbidden — use `unknown`, proper generics, or specific types
- Always use `import type` for type-only imports; split value and type imports from the same module into separate statements
- Props are always defined as `interface`, never `type`
- Always spread remaining props (`...props`) onto the root element of a component
 
---

## Naming & Exports
 
- Named exports only — no default exports (except framework-required files like `vite.config.ts`)
- Files and directories: `lowercase-kebab-case`
- React components: `PascalCase` arrow function const — `export const EmployeeForm = () => {}`
- Custom hooks: `camelCase` regular function declaration — `export function useEmployeeForm() {}`
- Server functions: `camelCase` const, **never exported** — only the options factory wrapping them is exported
- Query/mutation options factories: `camelCase` arrow const, exported — `export const getEmployeesOptions = ...`
- Zod schemas: `camelCase` ending in `Schema` — `employeeCreateSchema`
- Inferred types: same name as schema without the `Schema` suffix — `type Employee = z.infer<typeof employeeSchema>`
- Constants: `UPPER_SNAKE_CASE`
 
---

## Imports
 
- Use `@/` alias for all imports from outside the current feature
- Use relative imports within the same feature slice
- Never import from `@heroui/*` directly — always use re-exports from `@/shared/components/ui` (components + prop types) and `@/shared/hooks` (hooks)
- Never import from a feature's internal files from outside that feature — always go through its `index.ts` barrel

---

## Zod
 
- Always use namespace import: `import * as z from "zod"`
- This project uses Zod v4 — use `z.iso.datetime()`, `z.email()`, `.safeExtend()` (not v3 APIs)
- Compose search schemas via spread of `.shape`: `{ ...paginationSchema.shape, ...sortSchema.shape, ...filterSchema.shape }`
- All URL-driven schema fields must use `.catch()` to guarantee safe defaults
- Co-locate inferred types next to their schemas and export both

---

## Server Functions
 
- GET for reads, POST for writes (create, update, delete)
- Always attach `.inputValidator()` with a Zod schema
- Always annotate the handler return type explicitly using the shared type aliases (`QueryPaginatedReturnType<T>`, `MutationReturnType`, etc.)
- Server functions are private — never export them; only export the options factory that wraps them
- Wrap all DB calls in `try/catch`; log the real error server-side with a `[functionName]` prefix; throw a user-friendly Portuguese message to the client
- Never expose database errors, SQL, or stack traces to the client
- **Compound mutations** (e.g., contract creation = Contract + ContractEmployees + Revenues): use a single server function that receives the full payload and creates everything in one `prisma.$transaction()`. One API call, one rollback boundary. Never split multi-entity creation across multiple server function calls.
 
---

## Prisma / Database

- Import the Prisma client from `@/db` — never instantiate `new PrismaClient()` elsewhere
- **Every query** must filter by `firmId` (from session) and `deletedAt: null` — unless explicitly listing deleted records (e.g., admin status filter set to `inactive` or `all`)
- Never trust `firmId` from client input — always read it from the authenticated session
- Use `prisma.$transaction()` for all operations that span multiple tables (compound creates, soft-delete cascades, restore cascades)
- Reference lookup table rows by their `value` field (e.g., `"LAWYER"`, `"SOCIAL_SECURITY"`) — never by `id` — since IDs may differ across environments
- Never convert `Prisma.Decimal` to JavaScript `number` for financial arithmetic — use a decimal library (e.g., `decimal.js`) or Prisma's built-in Decimal methods
- Sort queries must always append `{ id: "asc" }` as a tiebreaker for deterministic pagination
- Keep Prisma `include` / `select` minimal — only fetch the relations needed for the current response

---

## Mutations & Cache
 
- Mutation options factories are pure — no `queryClient`, no `onSuccess`/`onError` callbacks
- Toast feedback and cache invalidation are handled in the feature form hook's `onSubmit` after `mutateAsync` resolves
- Cache keys always start with the feature-level cache key constant; never hardcode cache keys as inline strings
 
---

## Forms
 
- Forms are created via `useAppForm` from `@/shared/hooks/use-app-form`
- Each feature wraps `useAppForm` in a feature-specific hook that handles both create and edit modes
- Default values live in `utils/default.ts` as `defaultFormCreateValues()` and `defaultFormUpdateValues(entity)`
- Feature form hooks return `{ form, mutation, Form, FormField, FormSubmit, FormReset }`
- Validation uses `validators: { onSubmit: zodSchema }` — runs on submit; error messages in Portuguese
 
---

## Data Formatting
 
All data-to-UI transformations (currency, dates, percentages, document numbers) must go through shared formatter functions in `src/shared/lib/`. Never format inline in components.
 
---

## UI Patterns
 
**Entity details** — displayed in a slide-in drawer, never on a dedicated page.
 
**Create and edit forms** — displayed in a modal overlay, never on a dedicated page.
 
**Delete and restore** — always require a confirmation modal before executing.
 
**Data tables** — filter, sort, and pagination state are URL-driven; never use React state for data that belongs in URL search params.
 
**User feedback** — always use toast notifications (sonner) for mutation results; never use `alert()`, `window.confirm()`, or `console.log()` for user-facing feedback.
 
**Page layout** — every route page uses the `Wrapper` / `WrapperHeader` / `WrapperBody` / `WrapperFooter` component system from `@/shared/components/wrapper`.

---
 
## Environment Variables
 
Always import from the validated `env` object in `src/shared/lib/env.ts` — never access `process.env` directly in application code.

---
 
## After Every Change

1. Run `pnpm check` — auto-fixes formatting, import order, and lint issues via Biome. Never manually reformat code.
2. Run `npx tsc --noEmit` — verify there are no TypeScript compilation errors.
3. **Fix all errors before considering the task done.** If `tsc` reports errors, resolve them. Do not skip, suppress with `@ts-ignore`, or leave them for later.

A task is only complete when both commands pass with zero errors.
