## 1. Schema & Server

- [ ] 1.1 Add `name: z.string().catch("")` to `employeeFilterSchema` in `src/features/employees/schemas/filter.ts`
- [ ] 1.2 Update `getEmployees` handler in `src/features/employees/api/get.ts` to apply an OR clause filtering `fullName` and `oabNumber` by `data.name` (case-insensitive, only when non-empty)

## 2. Filter Component

- [ ] 2.1 Create `src/features/employees/components/filter/index.tsx` with an `EmployeeFilter` component that accepts `value: EmployeeFilter` and `onChange: (value: EmployeeFilter) => void` props
- [ ] 2.2 Add a text input labeled "Nome ou OAB" bound to `value.name` — call `onChange` on input change
- [ ] 2.3 Add a multi-select control labeled "Cargo" using types from `useEmployeeOptions` — bound to `value.type`
- [ ] 2.4 Add a multi-select control labeled "Perfil" using roles from `useEmployeeOptions` — bound to `value.role`

## 3. Barrel & Type-check

- [ ] 3.1 Export `EmployeeFilter` component from `src/features/employees/index.ts`
- [ ] 3.2 Run `pnpm check` then `npx tsc --noEmit` and fix all errors
