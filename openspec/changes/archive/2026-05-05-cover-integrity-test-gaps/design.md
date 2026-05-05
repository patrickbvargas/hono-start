## Context

The repository already uses Vitest as an executable contract for architecture boundaries, lifecycle semantics, authorization, and aggregate financial behavior. The missing coverage is not broad or random; it is concentrated in a few high-risk branches spread across multiple feature slices where mutations have side effects or where hook orchestration converts server results into user-visible navigation and feedback.

This change spans employees, fees, contracts, authentication, and attachments. The existing suite already establishes the local testing pattern for each area, so the safest implementation is to extend the current feature-local test files instead of introducing a new testing abstraction.

## Goals / Non-Goals

**Goals:**
- Add focused Vitest coverage for the highest-risk integrity branches currently not asserted.
- Keep new tests colocated with the owning feature modules and aligned with the documented slice boundaries.
- Prefer direct tests of data mutations and hooks over broader integration scaffolding.

**Non-Goals:**
- No runtime behavior changes.
- No new testing frameworks, shared harnesses, or end-to-end tooling.
- No attempt to exhaustively test every untested branch in the repository.

## Decisions

### Extend existing feature-local suites instead of creating new cross-feature files
The repository already organizes tests by owning feature and layer. Extending those files keeps failures local to the contract they protect and avoids inventing a second pattern.

Alternative considered:
- Add one umbrella "integrity gaps" suite. Rejected because it would blur ownership and make regressions harder to trace.

### Prioritize mutation branches and hook success paths over additional query happy paths
The largest risk comes from untested write guards and orchestration side effects:
- employee delete and restore lifecycle handling
- fee reparenting, remuneration-preservation, and contract-status synchronization
- contract lifecycle mutations
- password reset success orchestration
- attachment error mapping

Alternative considered:
- Expand more query permutations first. Rejected because query coverage is already comparatively strong.

### Treat OpenSpec delta as a test-suite contract refinement
This change does not alter product behavior. The spec update should therefore refine the existing `contract-aligned-test-suite` capability by making missing integrity expectations explicit instead of creating a new product capability.

Alternative considered:
- No spec delta because code behavior is unchanged. Rejected because the request explicitly asks for a proposal and the repository treats test coverage as part of the implementation contract.

## Risks / Trade-offs

- [Risk] Tests may overfit current implementation details instead of behavior. → Mitigation: assert branch outcomes, audit calls, transaction use, and safe errors instead of incidental call ordering where possible.
- [Risk] Cross-feature scope may tempt broad test churn. → Mitigation: limit each edit to the smallest existing suite that owns the uncovered branch.
- [Risk] Some documented lifecycle guards may expose missing production enforcement rather than just missing tests. → Mitigation: if a targeted test reveals absent behavior, implement the minimal production fix required by the documented contract and keep scope bounded to that rule.
