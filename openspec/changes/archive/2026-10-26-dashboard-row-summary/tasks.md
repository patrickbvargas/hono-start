## 1. Implementation

- [x] 1.1 Add validated persisted record targets to dashboard drilldown rows (no DB migration).
- [x] 1.2 Add generic row activation and compose existing summaries over the retained modal.

## 2. Verification

- [x] 2.1 Add focused behavior tests and update canonical documentation.
- [x] 2.2 Run formatting, TypeScript, relevant tests and browser interaction checks.

Validation: pnpm check and npx tsc --noEmit passed. Focused dashboard, drilldown and shared table suite: 27 files, 107 tests passed. OpenSpec strict validation passed. Desktop browser verified receipt and contract summaries, Enter/Space activation, Escape dismissal, drawer hit testing and return to the same modal page (11-20 of 57). Responsive viewport emulation was unavailable in the connected browser.
