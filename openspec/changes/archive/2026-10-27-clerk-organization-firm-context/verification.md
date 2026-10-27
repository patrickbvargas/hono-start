## Verification (2026-10-27)

- Read-only Clerk inspection confirmed the operator's current configuration: Matriz mapped to existing Firm 1; POA had no firmId. These are observed test values only, never application defaults.
- Browser: selecting POA from Matriz redirected to login with configuration/recovery guidance and OrganizationList; dashboard business data was removed.
- Browser: direct /clientes while POA was active redirected to /login?redirect=%2Fclientes, exposing no client list.
- Browser: selecting Matriz recovered /clientes using the preserved destination. No provider metadata or database records were edited.
- Focused session/authentication/sidebar suite: 87 tests passed across 16 files. Updated recovery copy: 2 tests passed again.
- pnpm check and npx tsc --noEmit passed. Only intended source formatting was retained.
- Strict OpenSpec validation passed.

## Scope note

Shared client/employee catalogs discussed during implementation remain a separate domain-model decision. This change retains current Firm ownership; global lookup options retain their existing shared behavior.

An additional focused Organization boundary test passed: the prior unit content is hidden and cached business data is cleared before route revalidation completes. TypeScript passed again after this test was added.

Broader-suite investigation: dashboard column-chart-layout expects h-85 while the unchanged HEAD component uses h-80; pending-work presentation expects an interactive severity summary while unchanged HEAD marks that section hidden. Both failures reproduced in an isolated run (4 failed, 4 passed across those two existing files). No files in dashboard, pending-work or contracts were modified by this change. The broader run also reported the existing contract filter-panel test failure.

## Completed broad verification

The full suite completed: 193 files passed and 7 failed; 985 tests passed and 11 failed (200 files / 996 tests collected before the new Organization boundary test was added). Three failures were attachment hard-link EPERM restrictions. The complete attachment-storage file was rerun with host filesystem permissions: all 12 tests passed. The remaining eight failures are in unchanged existing tests for chart height, hidden pending summary, contract filter UI, dashboard search defaults, and two route-prefetch contracts. Those application/test files were not modified by this change. The targeted session/authentication/sidebar suite and the additional Organization-boundary test passed. No production build was run.

## POA fixture rehearsal

After the operator configured POA to Firm 2, one marked test fixture was created through existing validated business mutation functions: Client 81, Employee 23, Contract 861, ContractEmployee 465, Revenue 217, Fee 208, generated Remuneration 418, Expense 343 and Attachment 36. Creation audit events were generated automatically under the explicit system test actor. Other-unit counts were unchanged. Existing scoped data readers admitted all eight tested resource types in POA and denied them in Matriz. Browser checks confirmed the one-row collections, client attachment and derived overdue pending-work item. Detailed IDs and results are in poa-isolation-fixtures.json and poa-isolation-verification.json. The fixture data itself resides in the configured database/storage, not Git. No Clerk metadata or accounts were changed by fixture setup.

## Archive verification

Both completed changes were synced and archived on 2026-10-27. After archive, OpenSpec validated all 44 remaining main specifications. The final focused authentication/session/sidebar run passed all 88 tests across 17 files with host permissions. No active changes remain.
