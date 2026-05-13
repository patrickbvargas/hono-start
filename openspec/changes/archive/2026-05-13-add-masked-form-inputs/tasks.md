## 1. OpenSpec And Dependency Setup

- [x] 1.1 Add proposal, design, and spec artifacts for the shared masked input and client-management behavior changes
- [x] 1.2 Add the `use-mask-input` dependency and verify the TanStack Form integration approach against current docs

## 2. Shared Form Infrastructure

- [x] 2.1 Implement the shared masked input field with built-in mask kinds and mask-aligned `maxLength`
- [x] 2.2 Register the shared masked input in `useAppForm` without changing existing field APIs

## 3. Client Form Adoption

- [x] 3.1 Replace client document and phone text inputs with the shared masked field
- [x] 3.2 Normalize client phone input alongside document normalization before mutations persist values

## 4. Verification

- [x] 4.1 Add focused Vitest coverage for shared masked input configuration and client normalization behavior
- [x] 4.2 Run `pnpm check` and `npx tsc --noEmit` and fix any resulting issues
