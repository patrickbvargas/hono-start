## 1. OpenSpec And Shared Form Field

- [x] 1.1 Register the attachment upload simplification in proposal, design, and delta spec artifacts for `attachment-management`.
- [x] 1.2 Add a shared `FormFile` component in `src/shared/components/form/file.tsx`, export it, and register it in `useAppForm`.

## 2. Attachment Upload Simplification

- [x] 2.1 Refactor attachment form state, schema helpers, and submit flow so the UI selects only a file and the system infers the attachment type automatically.
- [x] 2.2 Remove unused attachment type option loading from the attachment feature and update focused tests for form, queries, mutations, and frontend boundaries.
- [x] 2.3 Run `pnpm check` and `npx tsc --noEmit`, fix any issues, and then mark all completed tasks.
