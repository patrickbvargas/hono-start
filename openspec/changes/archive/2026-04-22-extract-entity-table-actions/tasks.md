## 1. Inventory

- [x] 1.1 Confirm the repeated row action menu instances in clients, employees, contracts, fees, and remunerations tables.
- [x] 1.2 Confirm no database migration is required because this is a frontend shared component extraction only.
- [x] 1.3 Use Context7 MCP or official shadcn/ui documentation if shared dropdown behavior is unclear before implementation.

## 2. Shared Component

- [x] 2.1 Add a shared row action menu component under `src/shared/components` with an explicit props interface and named export.
- [x] 2.2 Compose it from shared UI exports only; do not import vendor primitives from feature code.
- [x] 2.3 Preserve existing pt-BR labels, lucide icons, trigger accessibility label, menu alignment, and destructive delete variant.
- [x] 2.4 Support feature-provided visibility for view, edit, restore, and delete without embedding business policy in shared code.

## 3. Feature Table Migration

- [x] 3.1 Replace the clients table action dropdown markup with the shared component.
- [x] 3.2 Replace the employees table action dropdown markup with the shared component.
- [x] 3.3 Replace the contracts table action dropdown markup with the shared component while preserving completed/cancelled edit blocking.
- [x] 3.4 Replace the fees table action dropdown markup with the shared component while preserving parent contract status edit blocking.
- [x] 3.5 Replace the remunerations table action dropdown markup with the shared component while preserving full-read-model callbacks.
- [x] 3.6 Remove now-unused dropdown and row-action icon imports from migrated feature table files.

## 4. Verification

- [x] 4.1 Run `pnpm check` and fix all reported issues.
- [x] 4.2 Run `npx tsc --noEmit` and fix all reported issues.
- [x] 4.3 Run a focused search to confirm entity table files no longer duplicate the row action dropdown structure.
- [x] 4.4 Run `openspec validate extract-entity-table-actions --strict`.
