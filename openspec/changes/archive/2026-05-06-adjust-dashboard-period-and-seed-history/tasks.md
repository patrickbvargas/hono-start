## 1. Dashboard period behavior

- [x] 1.1 Update current-year shortcut generation to end on the current date instead of the last day of the year.
- [x] 1.2 Adjust dashboard filter and query tests to assert the new current-year canonical range and absence of future-month buckets.

## 2. Seed historical comparison fixtures

- [x] 2.1 Refactor the seed fixture generator to produce deterministic contract data per year with unique process numbers.
- [x] 2.2 Add 2025 fees and remunerations using the existing business scenarios and formulas so dashboard comparisons work without manual setup.

## 3. Validation

- [x] 3.1 Run focused dashboard tests covering period shortcuts and summary aggregation.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, fixing any issues before closing the change.
