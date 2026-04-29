## 1. Shared middleware foundation

- [x] 1.1 Create a canonical TanStack Start middleware for protected server functions using the shared authenticated-session helpers
- [x] 1.2 Define the shared middleware context contract and boundaries between middleware concerns and feature logic
- [x] 1.3 Migrate an initial set of protected server functions to the middleware pattern without changing business behavior

## 2. Verification

- [x] 2.1 Add or update tests for authenticated middleware context injection and unauthenticated failure behavior
- [x] 2.2 Verify migrated server functions preserve existing safe pt-BR errors and tenant-scoped behavior
- [x] 2.3 Run `pnpm check` and `npx tsc --noEmit`
