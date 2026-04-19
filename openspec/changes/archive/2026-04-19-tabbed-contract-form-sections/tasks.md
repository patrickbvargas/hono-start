## 1. Shared UI Boundary

- [x] 1.1 Review current HeroUI v3 Tabs documentation before implementation.
- [x] 1.2 Add a shared `Tabs` UI re-export if it is missing from `src/shared/components/ui`.
- [x] 1.3 Confirm feature code imports Tabs only from `@/shared/components/ui`.

## 2. Contract Form Layout

- [x] 2.1 Split the existing contract form markup into `Dados`, `Colaboradores`, and `Receitas` tab panels without changing field names or submit behavior.
- [x] 2.2 Keep collaborator assignment row add/remove behavior inside the `Colaboradores` panel.
- [x] 2.3 Keep revenue-plan row add/remove behavior inside the `Receitas` panel.
- [x] 2.4 Preserve create/edit modal wrapper, footer submit button, option queries, and edit-default hydration.

## 3. Validation Feedback

- [x] 3.1 Derive submit-time subsection error state from TanStack Form validation state.
- [x] 3.2 Mark `Colaboradores` as invalid for array-level and nested `assignments` errors.
- [x] 3.3 Mark `Receitas` as invalid for array-level and nested `revenues` errors.
- [x] 3.4 Render Portuguese tab error indicators/messages for hidden subsection errors after submit.
- [x] 3.5 Ensure tab error indicators clear after the form validates successfully.

## 4. Verification

- [x] 4.1 Verify no database migration is required.
- [ ] 4.2 Manually exercise create/edit form tabs with missing collaborator and revenue data.
- [x] 4.3 Run `pnpm check` and fix reported issues.
- [x] 4.4 Run `npx tsc --noEmit` and fix reported issues.
