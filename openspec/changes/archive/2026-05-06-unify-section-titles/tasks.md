## 1. OpenSpec Alignment

- [x] 1.1 Create proposal, design, and entity-foundation delta spec for section-title unification
- [x] 1.2 Define scope as shared UI consistency only, with no API or DB changes

## 2. Shared UI Implementation

- [x] 2.1 Add one shared section-title component with unified typography defaults and override support
- [x] 2.2 Update `FormSection` and `EntityDetail.Section` to consume shared title component without changing their surrounding layout contracts

## 3. Verification

- [x] 3.1 Run `pnpm check`
- [x] 3.2 Run `npx tsc --noEmit`
