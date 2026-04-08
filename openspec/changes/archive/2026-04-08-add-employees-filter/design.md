## Context

The employees feature already has `employeeFilterSchema` with `type`, `role`, and `status` fields, and the `getEmployees` server function already applies those filters. However, there is no UI component that exposes these controls. Additionally, there is no text search by name or OAB number — that field is missing from both the schema and the query.

The `useEmployeeOptions` hook already fetches type and role lookup lists. Filter state is managed via URL search params through the shared `employeeSearchSchema`.

## Goals / Non-Goals

**Goals:**
- Add a `name` text search field to `employeeFilterSchema` and the server query (OR match on `fullName` / `oabNumber`)
- Create `EmployeeFilter` component at `src/features/employees/components/filter/index.tsx`
- Export `EmployeeFilter` from the employees feature barrel

**Non-Goals:**
- Changes to pagination, sorting, or status filter behavior
- Adding new backend endpoints
- Status filter UI (already tracked separately)
- Mobile-specific layout changes

## Decisions

### 1. `name` field placed in `employeeFilterSchema`
The filter schema already composes into `employeeSearchSchema` via `.shape` spread. Adding `name: z.string().catch("")` there propagates it automatically to the search schema and to the `getEmployees` server function input — no schema restructuring needed.

**Alternative considered:** A separate `search` field at the top-level search schema. Rejected to keep all filter-dimension fields co-located in `employeeFilterSchema`.

### 2. Server-side OR query for name/OAB
The `name` value is applied as:
```ts
...(data.name ? {
  OR: [
    { fullName: { contains: data.name, mode: "insensitive" } },
    { oabNumber: { contains: data.name, mode: "insensitive" } },
  ],
} : {})
```
This lets users search "RS123456" or a partial name in a single field. Case-insensitive via Prisma's `mode: "insensitive"`.

**Alternative considered:** Separate `fullName` and `oabNumber` fields. Rejected for simplicity — the spec calls for a single search input.

### 3. Component lives in `components/filter/` subfolder
Consistent with the existing feature component structure (`components/form/`, `components/table/`, etc.). The component is a controlled form that receives current filter values and an `onChange` callback — it does not manage URL state internally.

**Alternative considered:** Inline filter controls directly in the table or page. Rejected — a dedicated component is reusable and testable.

### 4. Type and role filters use multi-select via `useEmployeeOptions`
The `useEmployeeOptions` hook fetches both lookup lists in parallel via `useSuspenseQueries`. The filter component reuses this hook, so no new data fetching is introduced.

## Risks / Trade-offs

- [Risk] `mode: "insensitive"` requires PostgreSQL (not SQLite). → Mitigation: The project uses PostgreSQL in all environments.
- [Risk] Adding `name` to the filter schema changes the query key shape for `getEmployeesOptions`. → Mitigation: The cache key already includes the full search object, so stale data is avoided automatically.
