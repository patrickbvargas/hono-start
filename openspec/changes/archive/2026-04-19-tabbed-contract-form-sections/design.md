## Context

The contract form is an aggregate editor rendered inside a modal. It currently shows core contract fields, assignment rows, and revenue rows in a single vertical flow, which makes the modal hard to scan once the assignment and revenue arrays grow.

The project frontend contract requires feature forms to use the shared app-form pattern, to keep create/edit flows in one feature form component, and to import HeroUI primitives only through shared UI re-exports. HeroUI v3 Tabs uses compound components (`Tabs`, `Tabs.ListContainer`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`) with matching tab/panel ids.

## Goals / Non-Goals

**Goals:**

- Group the contract form into `Dados`, `Colaboradores`, and `Receitas` tabs.
- Preserve a single aggregate form submission.
- Surface submit-time validation errors for sections that are not currently visible.
- Keep all user-facing copy in Portuguese.
- Keep HeroUI imports behind `@/shared/components/ui`.

**Non-Goals:**

- Change contract write schemas, business rules, or server mutations.
- Create separate saves per subsection.
- Change modal placement, route overlay behavior, or list workflows.
- Add a new UI dependency.

## Decisions

### Use HeroUI Tabs inside the existing modal body

HeroUI Tabs fits the desired subsection model and keeps all three form sections mounted inside the same form context. The form remains one aggregate form, so existing `form.AppField` bindings, array fields, and submit behavior continue to apply.

Alternative considered: collapsible sections. This keeps everything in one scroll flow but does not solve the wrapper-space problem as clearly when collaborator and revenue lists are both large.

### Add a shared Tabs re-export

If Tabs is not already exported from `src/shared/components/ui`, add `src/shared/components/ui/tabs.tsx` and re-export it from the shared UI index. This follows the repository rule that features must not import directly from `@heroui/*`.

Alternative considered: direct feature import from `@heroui/react`. Rejected because it violates the documented HeroUI boundary.

### Derive section error state from form validation state after submit

The tab labels should show error indicators only after the user submits and validation has run. The section detector should treat these names as belonging to their sections:

- `assignments`
- `assignments[0].employeeId`
- `assignments.0.employeeId`
- `revenues`
- `revenues[0].downPaymentValue`
- `revenues.0.downPaymentValue`

This covers both array-level business errors and row-field errors emitted by schema validation.

Alternative considered: adding manual validation state outside TanStack Form. Rejected because it duplicates source of truth and risks drift from actual form errors.

### Keep user orientation visible

Tabs with hidden errors should show an icon and a compact count/message in the tab label. When the active tab is not the errored section, the visible tab area should include a concise Portuguese message indicating that another section has errors.

Alternative considered: automatically switch to the first invalid tab on submit. This can be useful, but it may surprise users and complicate preserving their current editing context. The first implementation should prioritize explicit indicators; auto-switch can be revisited if user testing shows it is preferred.

## Risks / Trade-offs

- Hidden fields can still block submit -> tab error indicators and visible summary explain where to fix.
- Error-name formats can vary between TanStack Form and schema adapters -> section detection should support both bracket and dot paths plus array-level paths.
- Tabs may reduce simultaneous comparison between assignment and revenue rows -> tab labels should include counts so users retain high-level context.
- Long row lists can still exceed modal body height -> panels should keep existing scroll/modal behavior and avoid nested cards or additional heavy wrappers.

## Migration Plan

No data migration is required. Rollback is limited to restoring the previous single-flow form markup and removing the shared Tabs re-export if unused.
