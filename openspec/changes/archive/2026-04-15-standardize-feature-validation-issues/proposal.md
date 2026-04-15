## Why

Feature validation is currently split between direct `ctx.addIssue` usage and reusable helper functions that return plain messages. The issue-array pattern is clearer and easier to reuse across slices, so this change standardizes it before more features copy the older style.

## What Changes

- Standardize feature-local business validation helpers to return `ValidationIssue[]` instead of mixing Zod-specific logic into pure helpers.
- Keep Zod schemas responsible for translating returned issues into `ctx.addIssue` calls.
- Promote `src/shared/types/validation.ts` as the shared issue contract for all feature slices.
- Update feature slices that still inline business-rule `ctx.addIssue` logic or consume message-only helpers to use the shared helper-plus-adapter pattern.
- Keep lookup resolution, persistence checks, and mutation orchestration outside the pure validation helpers.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `form-validation-boundaries`: clarify that feature business validation helpers may return standardized issue arrays, and schemas are responsible for adapting those issues into Zod refinement errors.

## Impact

- Affected code: `src/shared/types/validation.ts`, `src/features/*/utils/validation.ts`, `src/features/*/schemas/form.ts`.
- Affected code: `src/shared/types/validation.ts`, `src/features/*/utils/validation.ts`, `src/features/*/schemas/form.ts`, `src/features/*/api/create.ts`, and `src/features/*/api/update.ts` for slices that use the shared helper in server-side validation.
- Affected docs/specs: `openspec/specs/form-validation-boundaries/spec.md`.
- Affected roles: developers and reviewers working on feature validation and form writes.
- Multi-tenant impact: none directly; this change only restructures validation boundaries and does not alter tenant scoping rules.

## Non-goals

- Changing any business validation rule or Portuguese message content.
- Introducing a new shared validator framework.
- Moving lookup-backed persistence checks into shared validation helpers.
- Changing route behavior, permissions, or persistence flow.
