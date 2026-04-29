## 1. Shared Pagination Feedback

- [x] 1.1 Update the shared pagination summary to render the visible absolute record range from the current URL-driven page and page size.
- [x] 1.2 Preserve the existing shared pagination layout and page-size selector behavior while applying the new summary text.

## 2. Verification

- [x] 2.1 Validate the shared pagination change against TypeScript and relevant search-contract coverage.
- [x] 2.2 Run `pnpm check` and `npx tsc --noEmit`, and fix any resulting issues before completing the change.
