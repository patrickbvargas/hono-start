# AGENTS Guide

> Reference document for AI agents working in this codebase.
> Read this file **in full** before making any change.

---

## 1. Stack Overview

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start (SSR via Nitro plugin) |
| Bundler | Vite 7 |
| UI | React 19, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Data fetching | TanStack Query (React Query v5) |
| Forms | TanStack Form (`@tanstack/react-form-start`) |
| Tables | TanStack Table v8 |
| Validation | Zod v4 |
| Database | Drizzle ORM + PostgreSQL (`pg`) |
| Linting / Formatting | Biome |
| Testing | Vitest + Testing Library |
| UI primitives | shadcn (base-nova style) + Base UI (`@base-ui/react`) + React Aria Components |
| Package manager | pnpm |
| Language | TypeScript 5 (strict mode) |

---

## 2. Project Structure

```
src/
├── db/                        # Database client & Drizzle schemas
│   ├── index.ts               # drizzle() instance
│   ├── migrations/            # Generated migrations (do NOT edit)
│   └── schemas/               # Drizzle table definitions
│       └── index.ts           # Barrel re-export
├── features/                  # Feature slices (domain modules)
│   ├── app-sidebar/           # Application sidebar feature
│   │   ├── components/        # Feature-scoped components
│   │   └── index.tsx          # Public API / barrel
│   └── employees/             # Example domain feature
│       ├── api/               # Server functions + query/mutation options
│       │   ├── create.ts
│       │   ├── delete.ts
│       │   ├── get.ts
│       │   └── update.ts
│       ├── components/        # Feature-scoped UI components
│       │   ├── delete/
│       │   ├── form/
│       │   └── table/
│       ├── constants/         # Cache keys, allowed columns, etc.
│       ├── hooks/             # Feature-scoped hooks
│       ├── schemas/           # Zod schemas (model, form, search, sort, filter)
│       ├── utils/             # Pure helper functions
│       └── index.ts           # Public API / barrel
├── routes/                    # TanStack file-based routes
│   ├── __root.tsx             # Root layout (sidebar, loading, devtools)
│   ├── index.tsx              # "/" route
│   └── funcionarios.tsx       # "/funcionarios" route
├── shared/                    # Cross-feature reusable code
│   ├── components/
│   │   ├── ui/                # shadcn primitives (do NOT edit manually)
│   │   ├── form/              # Form field components (Input, Autocomplete, etc.)
│   │   ├── data-table.tsx     # Generic data table
│   │   ├── pagination.tsx     # Generic pagination
│   │   └── wrapper.tsx        # Page wrapper layout
│   ├── config/                # App-wide configuration (routes map, etc.)
│   ├── hooks/                 # Shared hooks (useAppForm, usePagination, useSort)
│   ├── lib/                   # Utility functions (cn, errors, env, etc.)
│   ├── schemas/               # Shared Zod schemas (entity, option, pagination, sort)
│   └── types/                 # Shared TypeScript type utilities
├── styles/
│   └── global.css             # Tailwind entry + CSS variables
├── router.tsx                 # Router factory (createRouter + SSR query integration)
└── routeTree.gen.ts           # AUTO-GENERATED — never edit
```

### Feature slice anatomy

Every domain feature lives under `src/features/<feature-name>/` and **must** follow this internal layout (include only the sub-folders you actually need):

| Sub-folder | Purpose |
| --- | --- |
| `api/` | `createServerFn` handlers + `queryOptions` / `mutationOptions` factories |
| `components/` | React components scoped to this feature |
| `constants/` | Cache keys, enums, allowed column lists |
| `hooks/` | Custom hooks scoped to this feature |
| `schemas/` | Zod schemas: `model.ts`, `form.ts`, `search.ts`, `sort.ts`, `filter.ts` |
| `utils/` | Pure functions (defaults, formatters, mappers) |
| `index.ts` | **Barrel file** — the public API of the feature |

**Import rule**: Other features and routes **must only** import from the barrel `index.ts`. Never reach into a feature's internals directly from outside the feature.

---

## 3. TypeScript Rules

### 3.1 `any` is FORBIDDEN

Never use `any`. Not in variable types, not in generics, not in type assertions. Use `unknown`, proper generics, or specific types instead. If a library forces `any`, wrap it in a typed adapter.

### 3.2 Strict mode

`tsconfig.json` enables `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, and `noFallthroughCasesInSwitch: true`. All code must compile cleanly under these rules.

### 3.3 `import type`

Biome enforces `useImportType: "error"`. Always use `import type` for type-only imports:

```ts
import type { Employee } from "../schemas/model";
import type { QueryClient } from "@tanstack/react-query";
```

When a single import has both value and type members, split them:

```ts
import { queryOptions } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
```

### 3.4 Type inference with Zod

Co-locate inferred types next to their schemas. Export both:

```ts
export const employeeSchema = z.object({ ... });
export type Employee = z.infer<typeof employeeSchema>;
```

### 3.5 Utility types

Shared utility types go in `src/shared/types/`. Example: `NonEmptyKeys<T>` ensures at least one key is present in tuple types.

### 3.6 API return types

Use the shared return-type aliases from `src/shared/types/api.ts`:

| Type | Purpose |
| --- | --- |
| `QueryOneReturnType<T>` | Single entity |
| `QueryManyReturnType<T>` | Array of entities |
| `QueryPaginatedReturnType<T>` | `{ items: T[]; total: number }` |
| `MutationReturnType` | `{ success: true }` — standard mutation response |

Annotate `createServerFn` handler return types explicitly with these.

```ts
// Query handler
.handler(async ({ data }): Promise<QueryPaginatedReturnType<Employee>> => { ... })

// Mutation handler
.handler(async ({ data }): Promise<MutationReturnType> => { ... })
```

---

## 4. Formatting & Style (Biome)

| Rule | Value |
| --- | --- |
| Indent | **Tabs** |
| Quote style | **Double quotes** (`"`) |
| Semicolons | **Required** (default Biome) |
| Trailing commas | **All** (default Biome) |
| Import organization | Auto-sorted by Biome (`organizeImports: "on"`) |
| Line width | Default (80) |

Excluded from linting/formatting: `src/routeTree.gen.ts`, `src/styles.css`.

### Formatting is fully automated — never do it manually

**Do NOT manually reformat code** (change indentation, reorder imports, adjust spacing, etc.). All formatting and style fixes are applied automatically by:

- `pnpm check` — runs Biome check with `--write` (lint + format + import sort auto-fix). Run this after making code changes.
- The IDE (editor Biome integration) — formats on save.

An agent's job is to write correct logic. Formatting correctness is enforced by tooling, not by hand-editing whitespace or import order.

---

## 5. Naming Conventions

### 5.1 Files and directories

- **Always lowercase kebab-case**: `use-pagination.ts`, `data-table.tsx`, `nav-header.tsx`.
- **Short names with full entity name**: `model.ts` not `employee-model-schema.ts`. The parent directory already provides context (`employees/schemas/model.ts`).
- **Barrel files**: `index.ts` or `index.tsx` for public API re-exports.
- **`.ts`** for non-JSX files; **`.tsx`** for files containing JSX.

### 5.2 Exports

- **Always prefer named exports**. No default exports (except when required by a framework, e.g., `vite.config.ts`).
- Barrel files use `export *` (or selective named re-exports).

```ts
// ✅ Good
export const EmployeeTable = () => { ... };
export function useEmployeeForm() { ... }

// ❌ Bad
export default function EmployeeTable() { ... }
```

### 5.3 Variables and functions

| Kind | Convention | Example |
| --- | --- | --- |
| React component | `PascalCase`, arrow function expression (const) | `export const EmployeeForm = () => { ... }` |
| Custom hook | `camelCase`, regular function declaration | `export function useEmployeeForm() { ... }` |
| Server function | `camelCase`, const, **not exported** | `const getEmployees = createServerFn(...)` |
| Query/mutation options factory | `camelCase`, arrow, **exported** | `export const getEmployeesOptions = (search) => queryOptions({...})` |
| Schema | `camelCase` ending in `Schema` | `employeeCreateSchema` |
| Type / Interface | `PascalCase` | `EmployeeSearch`, `RouteItem` |
| Constant | `UPPER_SNAKE_CASE` | `EMPLOYEE_DATA_CACHE_KEY` |
| Zod inferred type | Same name as schema without `Schema` suffix | `type Employee = z.infer<typeof employeeSchema>` |

### 5.4 Component declaration style

- **Components**: arrow function expressions assigned to `const` (enables type-annotation when needed).
- **Hooks**: regular `function` declarations (distinguishes them from components at a glance).
- **Internal route components** (only used by the route file itself): regular function declarations (e.g., `function RouteComponent()`).

```ts
// Component
export const EmployeeTable = ({ employees }: EmployeeTableProps) => { ... };

// Hook
export function useEmployeeForm() { ... }

// Route-local component
function RouteComponent() { ... }
```

---

## 6. Imports & Path Aliases

### 6.1 The `@/` alias

`@/` maps to `src/` (configured in both `tsconfig.json` paths and `vite.config.ts` resolve alias). Always use `@/` for absolute imports from `src/`:

```ts
import { usePagination } from "@/shared/hooks/use-pagination";
import { ROUTES } from "@/shared/config/routes";
```

### 6.2 Relative imports

Use relative imports **only** within the same feature slice or the same directory subtree:

```ts
// Inside src/features/employees/hooks/form.ts
import { employeeCreateSchema } from "../schemas/form";
import { getDefaultFormCreateValues } from "../utils/default";
```

### 6.3 Import order

Biome auto-organizes imports. The expected order is:

1. Node built-ins (`node:url`, etc.)
2. External packages (`react`, `@tanstack/*`, `lucide-react`, `zod`, etc.)
3. Absolute project imports (`@/shared/*`, `@/features/*`)
4. Relative imports (`../`, `./`)

Type-only imports (`import type`) come after value imports within each group.

---

## 7. Zod Schemas

### 7.1 Import style

Always use **namespace import** for Zod:

```ts
import * as z from "zod";
```

For type-only usage (e.g., `z.infer`), use:

```ts
import type { z } from "zod";
```

### 7.2 Schema composition

Schemas are composed via spread of `.shape` (not `.merge()` or `.extend()`):

```ts
export const employeeSearchSchema = z.object({
	...paginationSchema.shape,
	...employeeSortSchema.shape,
	...employeeFilterSchema.shape,
});
```

Use `.safeExtend()` when extending `entityIdSchema` for model schemas:

```ts
export const employeeSchema = entityIdSchema.safeExtend({
	fullName: z.string(),
	// ...
});
```

Use `.extend()` when extending for form mutations (create → update adds `id`):

```ts
export const employeeUpdateSchema = entityIdSchema.extend(
	employeeCreateSchema.shape,
);
```

### 7.3 Schema patterns by purpose

| File | Purpose | Pattern |
| --- | --- | --- |
| `model.ts` | API response shape | `entityIdSchema.safeExtend({...})` |
| `form.ts` | Create/update/delete input validation | `z.object({...})` with `.min()`, `.regex()`, etc. |
| `search.ts` | URL search params (route `validateSearch`) | Composition of pagination + sort + filter |
| `sort.ts` | Sortable columns config | `createSortSchema<T>({ columns, defaultColumn })` |
| `filter.ts` | Filterable fields with `.catch([])` defaults | `z.object({ field: z.array(z.string()).catch([]) })` |

### 7.4 Safe defaults with `.catch()`

URL-driven schemas **must** use `.catch()` to guarantee safe defaults when search params are missing or invalid. This prevents runtime crashes from bad URLs:

```ts
page: z.coerce.number().catch(1).transform((p) => Math.max(1, p)),
```

### 7.5 The `optionSchema` transform

API endpoints returning select/dropdown options transform `{ id, description }` into `{ value, label }` via `optionSchema`. All consumers (autocomplete, multiselect) expect `{ value: string; label: string }`.

Export both input and output types for clarity:

```ts
export type OptionInput = z.input<typeof optionSchema>;  // { id: string | number; description: string }
export type Option = z.infer<typeof optionSchema>;        // { value: string; label: string }
```

---

## 8. Routing

### 8.1 File-based routes

Routes live in `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts` — **never edit that file**.

Route paths are in **Portuguese** (e.g., `/funcionarios`, `/clientes`, `/contratos`). The `ROUTES` config in `src/shared/config/routes.ts` maps route names to their paths, titles, and icons.

### 8.2 Route anatomy

A typical data route follows this pattern:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/funcionarios")({
	// 1. Validate URL search params with Zod
	validateSearch: zodValidator(employeeSearchSchema),

	// 2. Extract search as loader dependency (triggers re-fetch on change)
	loaderDeps: ({ search }) => ({ search }),

	// 3. Pre-populate query cache on the server
	loader: ({ context: { queryClient }, deps: { search } }) => {
		queryClient.ensureQueryData(getEmployeesOptions(search));
	},

	// 4. Loading state while data loads
	pendingComponent: () => <RouteLoading />,

	// 5. Error state when loader or component fails
	errorComponent: ({ error }) => <RouteError error={error} />,

	// 6. Render
	component: RouteComponent,
});

function RouteComponent() { ... }
```

**Every data route MUST define:**

- `validateSearch` — Zod validation for URL search params.
- `loaderDeps` — ensures search changes trigger re-fetches.
- `loader` — pre-populates the query cache on the server.
- `pendingComponent` — shown while the loader runs (skeleton or spinner).
- `errorComponent` — shown when the loader or component throws.
- `component` — the route's main UI.

### 8.3 Route context

The router context provides `queryClient: QueryClient`. Access it in loaders via `context.queryClient`. The router is created in `src/router.tsx` with `defaultPreload: "intent"` and SSR query integration.

### 8.4 Adding new routes

1. Create a new file in `src/routes/` (e.g., `clientes.tsx`).
2. TanStack will auto-regenerate `routeTree.gen.ts` on next dev server restart.
3. Add the route entry to `ROUTES` in `src/shared/config/routes.ts`.
4. Add the route to the sidebar sections in `src/features/app-sidebar/index.tsx`.

---

## 9. Data Layer (TanStack Query + Server Functions)

### 9.1 Server functions (`createServerFn`)

Server functions are defined in feature `api/` files. Pattern:

```ts
const getEmployees = createServerFn({ method: "GET" })
	.inputValidator(employeeSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Employee>> => {
		// Implementation
	});
```

**Rules:**

- **GET** for reads, **POST** for writes (create, update, delete).
- Always attach `.inputValidator()` with a Zod schema.
- Always annotate the handler return type explicitly.
- Server functions are **NOT exported** — they are private to the file. Only the options factory wrapping them is exported.

```ts
// ✅ Good — only the options factory is exported
const getEmployees = createServerFn({ method: "GET" }) ...

export const getEmployeesOptions = (search: EmployeeSearch) =>
	queryOptions({ ... });

// ❌ Bad — leaks the raw server function
export const getEmployees = createServerFn({ method: "GET" }) ...
```

### 9.2 Query options factories

Exported functions that return `queryOptions()`:

```ts
export const getEmployeesOptions = (search: EmployeeSearch) =>
	queryOptions({
		queryKey: [EMPLOYEE_DATA_CACHE_KEY, search],
		queryFn: () => getEmployees({ data: search }),
		staleTime: 5 * 60 * 1000,
	});
```

- Query keys **always** start with a feature-level cache key constant.
- Use `staleTime: "static"` for reference data that rarely changes (e.g., dropdown options).
- Use `staleTime: 5 * 60 * 1000` (5 min) for list data (adjust as needed).

### 9.3 Mutation options factories

Mutation options factories **receive `queryClient`** so they can invalidate related caches on success:

```ts
export const createEmployeeOptions = (queryClient: QueryClient) =>
	mutationOptions({
		mutationFn: createEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [EMPLOYEE_DATA_CACHE_KEY],
			});
			toast.success("Funcionário criado com sucesso");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Ocorreu um erro ao criar o funcionário");
		},
	});
```

**Rules:**

- Always accept `queryClient: QueryClient` as the first parameter.
- `onSuccess` **must** invalidate the feature's cache key to keep lists in sync.
- Use `toast` (sonner) for user-facing success/error feedback — **never use `alert()`**.
- Keep `onError` as a safety net — log + show toast.

**Usage in components:**

```ts
const queryClient = useQueryClient();
const mutation = useMutation(createEmployeeOptions(queryClient));
```

### 9.4 Cache key constants

Centralize all cache keys in `constants/index.ts`:

```ts
export const EMPLOYEE_DATA_CACHE_KEY = "employee" as const;
```

Sub-keys for related queries append strings: `[EMPLOYEE_DATA_CACHE_KEY, "types"]`.

### 9.5 Cache invalidation strategy

When a mutation succeeds, invalidate at the feature cache key level to refresh all related queries:

```ts
// Invalidates: ["employee", ...anything]
queryClient.invalidateQueries({
	queryKey: [EMPLOYEE_DATA_CACHE_KEY],
});
```

For targeted invalidation (e.g., only refetch the list, not the dropdown options):

```ts
queryClient.invalidateQueries({
	queryKey: [EMPLOYEE_DATA_CACHE_KEY, search],
	exact: true,
});
```

### 9.6 Data fetching in components

- **Lists**: use `useSuspenseQuery()` in the route component (data is pre-populated in loader).
- **Reference data / options**: use `useSuspenseQueries()` to batch multiple option fetches (see `useEmployeeOptions` hook).
- **Mutations**: use `useMutation()` at component level with the options factory.

---

## 10. Error Handling

### 10.1 Server function errors

Server function handlers **must** wrap database and external API calls in `try/catch`. Never let raw database errors leak to the client.

```ts
.handler(async ({ data }): Promise<QueryPaginatedReturnType<Employee>> => {
	try {
		const result = await db.select()...;
		return { items: result, total };
	} catch (error) {
		console.error("[getEmployees]", error);
		throw new Error("Erro ao buscar funcionários");
	}
})
```

**Rules:**

- Log the real error server-side with a `[functionName]` prefix for traceability.
- Throw a user-friendly Portuguese message to the client.
- Never expose database connection details, SQL, or stack traces to the client.

### 10.2 User-facing feedback

Use `sonner` toast for all mutation feedback:

```ts
import { toast } from "sonner";

// Success
toast.success("Funcionário criado com sucesso");

// Error
toast.error("Ocorreu um erro ao criar o funcionário");
```

**Never use `alert()`, `console.log()`, or `window.confirm()` for user-facing feedback.**

### 10.3 Route error boundaries

Every data route defines an `errorComponent` that catches loader and render errors:

```ts
errorComponent: ({ error }) => <RouteError error={error} />,
```

The shared `RouteError` component (in `shared/components/`) should display a friendly message with a retry action.

### 10.4 Suspense error boundaries

When a `useSuspenseQuery()` rejects inside a component tree, the nearest error boundary catches it. Place `<ErrorBoundary>` wrappers around independent data sections within a page if they should fail independently.

---

## 11. Loading & Suspense

### 11.1 Route-level loading

Every data route should define `pendingComponent`:

```ts
pendingComponent: () => <RouteLoading />,
```

Use a shared `RouteLoading` component from `shared/components/` that renders a spinner or page skeleton.

### 11.2 Component-level suspense

For data that loads after the initial route render (e.g., dialogs, lazy tabs), wrap in `<Suspense>`:

```tsx
<Suspense fallback={<Skeleton className="h-40 w-full" />}>
	<EmployeeDetails id={selectedId} />
</Suspense>
```

### 11.3 Global loading indicator

The root layout in `__root.tsx` shows a full-screen spinner when `useRouterState().isLoading` is `true`. This is the last-resort loading indicator — prefer route-level `pendingComponent` for better UX.

---

## 12. Forms (TanStack Form)

### 12.1 `useAppForm` hook

Forms are created via the custom `useAppForm` hook in `src/shared/hooks/use-app-form.ts`. This hook injects all shared field components (`Input`, `Number`, `Autocomplete`, etc.) and form components (`Form`, `Submit`, `Reset`).

### 12.2 Feature form hooks

Each feature wraps `useAppForm` in a feature-specific hook that handles both **create** and **edit** modes:

```ts
interface UseEmployeeFormOptions {
	mode: "create" | "edit";
	initialData?: EmployeeUpdate;
	onSuccess?: () => void;
}

export function useEmployeeForm({
	mode,
	initialData,
	onSuccess,
}: UseEmployeeFormOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		mode === "create"
			? createEmployeeOptions(queryClient)
			: updateEmployeeOptions(queryClient),
	);

	const form = useAppForm({
		defaultValues: initialData ?? getDefaultFormCreateValues(),
		validators: {
			onSubmit:
				mode === "create" ? employeeCreateSchema : employeeUpdateSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({ data: value });
			onSuccess?.();
		},
	});

	return {
		form,
		mutation,
		Form: form.Form,
		Field: form.AppField,
		Submit: form.Submit,
		Reset: form.Reset,
	};
}
```

**Key points:**

- Accept `mode` to switch between create/edit validation and mutation.
- Accept optional `initialData` for pre-populating edit forms.
- Accept `onSuccess` callback for navigation/dialog closing after mutation.
- Return `mutation` alongside form so the component can check `mutation.isPending`, `mutation.isError`, etc.

### 12.3 Form component usage

```tsx
const { form, Form, Field, Submit } = useEmployeeForm({ mode: "create" });

<Form form={form}>
	<Field name="fullName">
		{(field) => <field.Input label="Nome" isRequired />}
	</Field>
	<Submit />
</Form>
```

Field components receive props from `FieldCommonProps` (`label`, `description`, `isRequired`, `isDisabled`, `classNames`).

### 12.4 Default values

Default form values are provided by a factory function in `utils/default.ts`:

```ts
export const getDefaultFormCreateValues = (): EmployeeCreate => ({
	fullName: "",
	email: "",
	// ...
});
```

### 12.5 Form validation

- Validation uses `validators: { onSubmit: zodSchema }` — validation runs on submit.
- Field-level error display checks `field.state.meta.isTouched && !field.state.meta.isValid`.
- Zod error messages are in **Portuguese**.

---

## 13. Component Patterns

### 13.1 Props definition

Define props as an `interface` (not `type`). Extend from the underlying element/component props:

```ts
interface FormInputProps
	extends FieldCommonProps,
		React.ComponentPropsWithoutRef<typeof Input> {}
```

Or for simple wrapper components:

```ts
interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: React.ReactNode;
}
```

Always spread remaining props (`...props`) onto the root element.

> **Exception**: Files inside `src/shared/components/ui/` are generated by the shadcn CLI and may use `type X = { ... }` for internal props. Do **not** edit those files to conform — they fall under the "Do NOT Touch" rule (see §23).

### 13.2 The `cn()` utility

Use `cn()` from `@/shared/lib/utils` to merge Tailwind classes. Never concatenate class strings manually:

```ts
className={cn("flex items-center gap-2", isActive && "text-primary", className)}
```

### 13.3 Page layout

Every route page should use the `Wrapper` component system:

```tsx
<Wrapper title="Page Title">
	<WrapperBody>
		{/* Main content */}
	</WrapperBody>
	<WrapperFooter>
		{/* Pagination, actions */}
	</WrapperFooter>
</Wrapper>
```

### 13.4 Sorting and pagination in tables

- Sorting is URL-driven via `useSort()` hook. Table headers use `<Link to="." search={getSortSearch(columnId)}>`.
- Pagination is URL-driven via `usePagination()` hook. The `<Pagination>` component reads current page/limit from search params.
- Both hooks return `getXSearch()` functions that produce a search updater `(prev) => ({...prev, ...newParams})`.

### 13.5 Columns definition

Table columns are defined with `createColumnHelper<T>()` inside `React.useMemo()`. Control sortability via `enableSorting` and reference the feature's `ALLOWED_SORT_COLUMNS` constant.

### 13.6 UI primitives

shadcn components live in `src/shared/components/ui/`. These are generated by the `shadcn` CLI — **do not edit them manually** unless customizing. The `components.json` config points aliases to `@/shared/components`, `@/shared/lib/utils`, etc.

---

## 14. Shared Schemas Reference

| Schema | Location | Purpose |
| --- | --- | --- |
| `entityIdSchema` | `src/shared/schemas/entity.ts` | `{ id: string }` — base for all entities |
| `optionSchema` | `src/shared/schemas/option.ts` | Transforms `{ id, description }` → `{ value, label }` |
| `paginationSchema` | `src/shared/schemas/pagination.ts` | `{ page, limit }` with coerce + catch defaults |
| `sortSchema` | `src/shared/schemas/sort.ts` | Generic `{ column, direction }` |
| `createSortSchema<T>` | `src/shared/schemas/sort.ts` | Factory for typed sort with allowed columns |

---

## 15. Sorting & Pagination (URL-Driven State)

All list state (page, limit, sort column, sort direction, filters) lives in URL search params, not in React state.

### Flow

1. Route declares `validateSearch: zodValidator(featureSearchSchema)`.
2. Search schema composes `paginationSchema` + `sortSchema` + `filterSchema` with `.catch()` defaults.
3. Loader reads validated search and calls `queryClient.ensureQueryData(getXOptions(search))`.
4. Component reads search via `Route.useSearch()` and passes to `useSuspenseQuery()`.
5. User interactions (sort click, page change) navigate with updated search params via `<Link>` or `navigate()`.

---

## 16. Database (Drizzle)

- **Client**: `src/db/index.ts` — `drizzle(env.DATABASE_URL, { schema })`.
- **Schemas**: `src/db/schemas/*.ts` — Drizzle table definitions using `pgTable()`.
- **Barrel**: `src/db/schemas/index.ts` — re-exports all table schemas.
- **Config**: `drizzle.config.ts` — reads `DATABASE_URL` from `.env.local` / `.env`.
- **Migrations**: output to `src/db/migrations/`.
- Use `pnpm db:generate` after schema changes, `pnpm db:push` for dev, `pnpm db:migrate` for production.

---

## 17. Environment Variables

### 17.1 Validation

All required environment variables **must** be validated at startup using Zod. Define the schema in `src/shared/lib/env.ts`:

```ts
import * as z from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url("DATABASE_URL é obrigatória"),
});

export const env = envSchema.parse(process.env);
```

### 17.2 Usage

Always import from the validated `env` object — never access `process.env` directly in application code:

```ts
// ✅ Good
import { env } from "@/shared/lib/env";
const db = drizzle(env.DATABASE_URL, { schema });

// ❌ Bad
const db = drizzle(process.env.DATABASE_URL ?? "", { schema });
```

### 17.3 Security

- **Never hardcode** API keys, secrets, or connection strings in source code.
- Use `.env.local` for local development (gitignored).
- Use environment variables from the deployment platform for production.
- The `.env.example` file documents required variables without real values.

---

## 18. Locale & Copy

- The application locale is **Portuguese (pt-BR)**: `<html lang="pt-BR">`.
- Route paths are in Portuguese: `/funcionarios`, `/clientes`, `/contratos`.
- UI labels, form messages, validation error messages, and button text are all in Portuguese.
- Preserve this locale in all code unless explicitly changing to a different locale strategy.

Examples: `"Nome"`, `"Email inválido"`, `"Salvar"`, `"Limpar"`, `"Nenhum registro encontrado."`, `"Carregando..."`.

---

## 19. Cross-Feature Dependencies

### 19.1 Allowed imports

Features **may** import from other features' barrel `index.ts`:

```ts
// Inside src/features/contracts/hooks/form.ts
import { getEmployeesOptions } from "@/features/employees";
```

### 19.2 Rules

- **Always through the barrel** — never import from a feature's internal files.
- **No circular dependencies** — if Feature A imports from Feature B, Feature B must NOT import from Feature A.
- **Shared data goes to `shared/`** — if two or more features need the same schema, hook, or utility, extract it to the appropriate `shared/` sub-folder.
- **Prefer composition over coupling** — if a feature only needs dropdown options from another, use that feature's exported query options factory in a local hook rather than importing components directly.

---

## 20. Testing

### 20.1 Framework

Tests use **Vitest** for unit/integration tests and **Testing Library** for component tests. Configuration is in `vitest.config.ts`.

### 20.2 File location

Tests are co-located next to the source files they test:

```
src/features/employees/
├── schemas/
│   ├── form.ts
│   └── form.test.ts        ← co-located test
├── api/
│   ├── get.ts
│   └── get.test.ts          ← co-located test
├── utils/
│   ├── default.ts
│   └── default.test.ts      ← co-located test
```

### 20.3 Naming

- Test files: `<source-file>.test.ts` or `<source-file>.test.tsx`.
- Test suites: `describe("<ExportedName>", () => { ... })`.
- Test cases: `it("should <expected behavior>", () => { ... })`.

### 20.4 What to test (priority order)

| Priority | Target | Why |
| --- | --- | --- |
| 🔴 High | Zod schemas (`schemas/*.ts`) | Cheap to test, high value — catches validation regressions early |
| 🔴 High | Utility functions (`utils/*.ts`) | Pure functions, easy to test, critical for correctness |
| 🟡 Medium | Server function handlers (`api/*.ts`) | Integration tests with mocked DB |
| 🟡 Medium | Custom hooks (`hooks/*.ts`) | Test with `renderHook` from Testing Library |
| 🟢 Low | Components (`components/*.tsx`) | Test critical interactions, not styling |

### 20.5 Schema test example

```ts
import { describe, expect, it } from "vitest";
import { employeeCreateSchema } from "./form";

describe("employeeCreateSchema", () => {
	it("should reject empty fullName", () => {
		const result = employeeCreateSchema.safeParse({
			...validDefaults,
			fullName: "",
		});
		expect(result.success).toBe(false);
	});
});
```

### 20.6 Running tests

```sh
pnpm test          # Run all tests once
pnpm test --watch  # Watch mode during development
```

---

## 21. Adding a New Feature (Checklist)

When creating a new domain feature (e.g., `clients`):

1. **Create the feature directory**: `src/features/clients/`.

2. **Schemas** (`schemas/`):
   - `model.ts` — entity shape extending `entityIdSchema`.
   - `form.ts` — create/update/delete Zod schemas + inferred types.
   - `filter.ts` — filter fields with `.catch([])`.
   - `sort.ts` — `createSortSchema<Client>({ columns, defaultColumn })`.
   - `search.ts` — compose pagination + sort + filter.

3. **Constants** (`constants/index.ts`):
   - Cache key: `CLIENT_DATA_CACHE_KEY = "client" as const`.
   - Allowed sort columns tuple.

4. **API** (`api/`):
   - `get.ts` — `createServerFn` (private) + `queryOptions` factories (exported).
   - `create.ts`, `update.ts`, `delete.ts` — `createServerFn` (private) + `mutationOptions` factories (exported, accepting `queryClient`).
   - Server functions use POST for writes, GET for reads.
   - Handlers wrap DB calls in `try/catch`.

5. **Utils** (`utils/`):
   - `default.ts` — `getDefaultFormCreateValues()`.

6. **Hooks** (`hooks/`):
   - `form.ts` — `useClientForm({ mode, initialData, onSuccess })` wrapping `useAppForm`.
   - `options.ts` — `useClientOptions()` for dropdown/select data.

7. **Components** (`components/`):
   - `table/index.tsx` — table with columns + sorting.
   - `form/index.tsx` — form using the feature hook.
   - `delete/index.tsx` — delete confirmation dialog.

8. **Barrel** (`index.ts`):
   - Re-export only the public API needed by routes: query options, mutation options, components, search schema/type.

9. **Route** (`src/routes/clientes.tsx`):
   - `validateSearch` → `loaderDeps` → `loader` → `pendingComponent` → `errorComponent` → `component`.

10. **Sidebar**: Add to `ROUTES` config and sidebar sections.

11. **Tests**: Add schema and utility tests.

---

## 22. Developer Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format |
| `pnpm check` | Biome check with auto-fix (lint + format) |
| `pnpm test` | Run Vitest |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema to dev DB |
| `pnpm db:pull` | Pull schema from DB |
| `pnpm db:studio` | Open Drizzle Studio |

---

## 23. Do NOT Touch

- `src/routeTree.gen.ts` — auto-generated by TanStack Router.
- `src/shared/components/ui/*` — generated by shadcn CLI. Only modify if intentionally customizing a primitive. Style rules (e.g. `interface` over `type` for props) do **not** apply to these files.
- `src/shared/components/form/demo.tsx` — temporary test/playground file. Not subject to project conventions.
- `pnpm-lock.yaml` — only modify via `pnpm install`.

---

## 24. Code Style Quick Reference (TL;DR)

```
✅ Named exports only (no default exports)
✅ Tabs for indentation, double quotes for strings  ← enforced by pnpm check / IDE
✅ import type for type-only imports
✅ import * as z from "zod" (namespace import)
✅ @/ alias for all src/ imports from outside the current feature
✅ Relative imports within the same feature
✅ Arrow function expressions for components: export const X = () => {}
✅ Function declarations for hooks: export function useX() {}
✅ Interface for props (not type)
✅ Spread remaining props onto root element
✅ cn() for Tailwind class merging
✅ Portuguese for all user-facing text
✅ .catch() on all URL-driven schema fields
✅ Explicit return type annotations on server function handlers
✅ Query keys start with feature cache key constant
✅ Server functions are NOT exported — only options factories are
✅ Mutation options factories accept queryClient as first parameter
✅ Mutations invalidate cache on success via queryClient
✅ Toast (sonner) for user-facing success/error feedback
✅ Server function handlers wrap DB calls in try/catch
✅ Every data route defines pendingComponent and errorComponent
✅ Form hooks support create/edit modes via options parameter
✅ Environment variables validated via Zod in shared/lib/env.ts
✅ Tests co-located next to source files (*.test.ts)
✅ Run `pnpm check` after changes to auto-fix formatting, imports and lint

❌ NEVER use `any`
❌ NEVER edit routeTree.gen.ts
❌ NEVER use default exports
❌ NEVER import from feature internals outside the feature
❌ NEVER hardcode query cache keys as inline strings
❌ NEVER put domain logic in shared/
❌ NEVER use React state for data that belongs in URL search params
❌ NEVER skip Zod validation on server function inputs
❌ NEVER manually reformat code (indentation, import order, spacing) — let pnpm check do it
❌ NEVER use alert() or console.log() for user-facing feedback
❌ NEVER export raw server functions — only options factories
❌ NEVER use GET for write operations (create, update, delete must use POST)
❌ NEVER access process.env directly — use the validated env object
❌ NEVER let raw database errors leak to the client
❌ NEVER create circular dependencies between features
```
