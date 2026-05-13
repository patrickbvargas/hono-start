## Why

Client forms currently use plain text inputs for CPF, CNPJ, and phone, which forces users to type dense numeric values without formatting feedback. The project already persists normalized values for documents, so adding reusable masked inputs now improves data entry without changing the underlying storage contract.

## What Changes

- Add a shared masked TanStack Form field for reusable input masking through the existing `useAppForm` field registry.
- Support built-in shared masks for CPF, CNPJ, and Brazilian phone numbers, with visible `maxLength` aligned to each mask.
- Update the client create and edit form to use masked inputs for document and phone fields.
- Normalize masked phone input before persistence so client records continue storing unformatted values.
- Add focused tests for the shared masked field contract and client normalization behavior.

## Capabilities

### New Capabilities
- `shared-masked-form-input`: Reusable shared form field that applies built-in masks while preserving the existing shared UI and TanStack Form patterns.

### Modified Capabilities
- `client-management`: Client create and edit flows gain masked CPF, CNPJ, and Brazilian phone entry while keeping normalized persisted values.

## Impact

- Affected code: `src/shared/components/form`, `src/shared/hooks/use-app-form.ts`, `src/features/clients/components/form`, `src/features/clients/schemas/form.ts`, and related tests.
- Dependency: add `use-mask-input` for TanStack Form-compatible masking.
- Persistence: no database migration; client document and phone values remain stored without mask characters.
