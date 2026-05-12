## 1. OpenSpec And Authentication Contract

- [x] 1.1 Record the login transition UX change in the OpenSpec proposal, design, and authentication delta spec

## 2. Login Transition Implementation

- [x] 2.1 Extend the login hook busy state to cover credential submission, session refresh, and navigation handoff
- [x] 2.2 Keep the login submit button disabled and labeled as busy for the full login transition

## 3. Verification

- [x] 3.1 Add focused authentication hook coverage for the extended busy-state behavior
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, then fix any issues before marking the change complete
