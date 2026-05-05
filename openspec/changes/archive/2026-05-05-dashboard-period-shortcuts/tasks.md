## 1. Dashboard filter behavior

- [x] 1.1 Define canonical dashboard period shortcut ranges and active-shortcut matching rules using existing `dateFrom` and `dateTo` search values.
- [x] 1.2 Extend the dashboard filter hook so shortcut clicks update form values and submit through the existing URL-driven filter flow.

## 2. Dashboard header UI

- [x] 2.1 Add responsive shortcut buttons beside the inline collaborator filter using shared UI button primitives.
- [x] 2.2 Keep the manual popover period controls unchanged and ensure custom edits clear or restore shortcut active state based on exact range matching.

## 3. Verification

- [x] 3.1 Add or update dashboard tests for default year shortcut, last-6-month shortcut, last-12-month shortcut, and manual custom range behavior.
- [x] 3.2 Confirm no DB migration is required.
- [x] 3.3 Run `pnpm check`.
- [x] 3.4 Run `npx tsc --noEmit`.
