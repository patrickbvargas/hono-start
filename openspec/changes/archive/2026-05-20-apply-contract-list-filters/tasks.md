## 1. Implementation

- [x] 1.1 Update `src/features/contracts/hooks/use-filter.ts` to expose explicit apply behavior and current/default filter state for active-chip interactions.
- [x] 1.2 Replace `src/features/contracts/components/filter/index.tsx` to use `ListFilters` with desktop popovers, mobile drawer, and active-filter chips.

## 2. Verification

- [x] 2.1 Add focused Vitest coverage for `useContractFilter` apply/reset behavior.
- [x] 2.2 Run targeted tests plus repository checks relevant to this change.
