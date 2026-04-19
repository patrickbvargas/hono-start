## Why

The contract create/edit form currently places contract fields, collaborator assignments, and revenue plans in one long modal body, which makes the aggregate sections hard to scan and consumes too much wrapper space. Users also need clear validation feedback when a hidden subsection has submit errors, otherwise they can be blocked without seeing where to fix the form.

## What Changes

- Organize the contract form into subsections using HeroUI Tabs:
  - `Dados` for core contract fields.
  - `Colaboradores` for assignment rows.
  - `Receitas` for revenue-plan rows.
- Add submit-aware error indicators to tab labels when a subsection has validation errors.
- Show a Portuguese error summary/message when submitted errors exist outside the currently visible tab.
- Preserve the existing contract create/edit schema, mutation flow, modal workflow, and app-form boundary.
- Add a shared HeroUI Tabs re-export if needed so feature code continues importing UI primitives through `@/shared/components/ui`.

## Non-goals

- Do not change contract validation rules, revenue calculations, assignment business rules, or persistence behavior.
- Do not split the contract aggregate into multiple submit flows.
- Do not introduce a new form framework or bypass the shared app-form pattern.
- Do not change route-level overlay behavior or contract list behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `contract-management`: contract create/edit forms shall group aggregate subsections with tabs and signal submit errors for hidden subsections.

## Impact

- Affected code:
  - `src/features/contracts/components/form/index.tsx`
  - `src/shared/components/ui/index.ts`
  - potential new `src/shared/components/ui/tabs.tsx`
- Affected users:
  - Administrators and regular users who can create or edit contracts.
- Multi-tenant implications:
  - None. This is a client-side form organization and validation-feedback change; tenant scope remains derived from session at server boundaries.
- Dependencies:
  - Uses existing `@heroui/react` Tabs through the shared UI re-export boundary.
