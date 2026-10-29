# Financial authorization — approved target

Read [financial rules](FINANCIAL_SYSTEM.md) first. This is a proposed exact-key catalog for implementation; it does not claim keys already exist in Clerk. Never treat a role name as a permission grant. Server enforcement combines current verified membership grants, Person/EmployeeProfile identity, active Firm, resource ownership and scope. Provider failures deny access.

## Roles and identity

Plan production presets around Member and Admin only. Verify actual Clerk production limits before deployment; the reported free-plan limitation remains an open provider check. Do not build a third permanent finance role or per-user exceptions. An optional temporary dev role must not become required infrastructure. Coarse roles do not replace granular keys. Every account, including Admin, requires an active, non-deleted global Person with active EmployeeProfile. Proposed privateMetadata.personId replaces employeeId through an explicit coordinated switch, never a silent ID reinterpretation. Organization privateMetadata.firmId remains validated server-side.

Admin preset receives approved current-Firm management keys; Member starts with assigned contract receipts visibility and own remuneration visibility only as explicitly granted. Member receipt registration is OPTIONAL and defaults OFF. Every mutation remains permission-checked, including administrators. Company-wide people and catalogs never authorize another branch's operations.

## Proposed exact keys

| Resource | Keys | Member default / boundary |
|---|---|---|
| People | org:people:read, create, update, delete, restore | Preserve approved client access; EmployeeProfile/private compensation fields need independent existing collaborator authority. Do not widen access by merging tables. |
| Contracts | Existing org:contracts keys, including read_all/read_assigned | Preserve current assignment eligibility, not recommending-only access. |
| Expenses | org:expenses:read, create, update, delete, restore | OFF; Member has no standalone expense workflow. |
| Receivables | org:receivables:read_all, read_assigned, generate, create, update, cancel, restore | read_assigned within visible contracts; mutation keys OFF initially. create means direct entry and is unavailable in Member preset. |
| Receipts | org:receipts:read_all, read_assigned, create, reverse | read_assigned; create OFF, may be enabled only within assigned contracts. reverse OFF. No edit/delete/restore of confirmed cash events. |
| Payables | org:payables:read_all, read_own, generate, create, update, cancel, restore | read_own only for remuneration benefiting session Person, with current visible originating contract; all mutations OFF. |
| Payments | org:payments:read_all, read_own, create, reverse | read_own only for own remuneration and readable source contract; mutations OFF. |
| Financial adjustments | org:financial_adjustments:discount, charges, reclassify | OFF; required in addition to corresponding title/settlement write grant. Discounts and discretionary adjustments require reasons. |
| Cash flow | org:cash_flow:read_all, read_scoped | No full-Firm cash; scoped projection contains only authorized inflows and own remuneration outflows. No expenses or direct entries. |
| Financial settings | org:financial_settings:read, update | OFF; controls Firm cutoff/due day, not globally scoped catalogs. |
| Global catalogs | org:financial_catalogs:read, create, update | Read only when consumer resource accessible; management OFF. Includes analytics and methods; no Firm ownership. |
| Reports | org:financial_reports:export_all, export_scoped | Scoped only if explicitly granted; same visibility as data source. |
| Attachments / audit | Existing explicit attachment and audit keys plus owner read/write scope | Never infer owner access from attachment ID, request correlation ID or audit permission alone. |

Each comma-separated suffix above denotes a separate full key; e.g. org:receipts:create and org:receipts:reverse. Implementation must enumerate literal keys in schema.ts and ordinary permission checks; do not build wildcard expansion, generated action registries or local role matrices. Catalog changes require review against Clerk constraints; document any approved naming adaptation.

## Non-negotiable Member confidentiality

A Member never sees another collaborator's remuneration. No read_all grant is configured in the Member preset. No contract assignment, person link, operational permission or unrelated receipt write permission can expose other beneficiaries. Treat this as a policy invariant, not only a UI convention; diagnose misconfigured presets in setup verification. Authorized Admin views require explicit full read grants. If runtime needs a trusted Member/Admin distinction to enforce the invariant against bad grants, resolve it from verified provider membership once and document this narrow confidentiality guard; do not revive role-based permission bypasses.

Member scope is always contract-derived. Own beneficiary ID alone cannot expose direct Payables or compensation from inaccessible contracts. Member cannot read or mutate direct financial entries or expenses. Broad expense/direct workflows need explicitly authorized Admin grants. Resource lists, options, counts, sums, exports, title details, settlement selections/events, calculations, attachments, audit payloads and pending-work notifications must filter before aggregation. A receipt response must not return hidden commission rows or their totals/counts. A settlement proof containing other Persons or beneficiaries is not readable just because one source contract is readable; proof ownership is per Receipt/Payment, never a lot.

## Transition and verification

Prepare and review provider catalog/presets before switching runtime gates. Verify person binding, membership revocation, Firm mapping, organization-switch cache clearing and configured Member defaults in development. Replace fee/remuneration keys with Receipt/Payable access deliberately; unknown/missing new grants deny rather than fall back to legacy role authority. Preserve baseline branch and dev provider configuration snapshot for rollback. Never automatically map fees:create to Member receipts:create, because target default is OFF.

Required negative tests: cross-Firm ID, unassigned contract, recommending-only assignment, inactive Person/profile, missing provider mapping, Member request for another beneficiary via direct ID, multi-selection correlation, export, aggregate and attachment URL. Required positive test: explicitly granted Member receipts:create can settle only assigned-contract Receivables. Receipt transaction cannot leak downstream remuneration of other participants in response/error.

## Registration navigation and field boundaries

Render separate Clientes, Fornecedores and Colaboradores navigation/screens over shared Person. Member has no supplier/collaborator management access; customer reads remain assigned-contract scoped. Explicit subject/action permissions govern Admin management and collaborator profile/percentage/access fields. Enforce boundaries server-side before serialization, options, counts and exports, not only through hidden menu items. A readable customer identity must not expose EmployeeProfile, compensation percentages, other role flags or access bindings. Already-permitted assigned-contract team projections and own remuneration do not grant collaborator-directory access. No provider keys are created by this documentation update; resolve supplier keys within phase02's exact-key catalog before implementation.
