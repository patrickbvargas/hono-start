## 1. Search canonicalization

- [x] 1.1 Identify route-backed screens with validated search defaults that should strip redundant default params
- [x] 1.2 Add route-level `stripSearchParams` middleware and explicit default objects where needed
- [x] 1.3 Align route reset helpers or shared defaults so UI reset behavior matches URL canonicalization

## 2. Verification

- [x] 2.1 Add or update tests for default URL stripping and non-default search param preservation
- [x] 2.2 Verify shared and refreshed URLs still restore the same visible state
- [x] 2.3 Run `pnpm check` and `npx tsc --noEmit`
