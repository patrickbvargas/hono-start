## Context

The repository already has strong architectural and validation guardrails plus targeted feature coverage for clients, fees, attachments, and session policy. The largest remaining business-risk areas are not missing because the project lacks a test pattern; they are missing because several high-value slices still do not have direct tests at the data/query/mutation boundary. This change should extend the existing `contract-aligned-test-suite` capability rather than invent a new quality model.

## Goals / Non-Goals

**Goals:**

- Define a clear coverage contract for the business-critical slices that still lack direct tests.
- Prioritize deterministic, feature-local Vitest tests at rule, schema, query, mutation, and orchestration boundaries already used in the repository.
- Protect multi-tenant, role-aware, lifecycle, and financial-calculation behavior with explicit acceptance criteria.

**Non-Goals:**

- Do not require exhaustive line coverage across every file.
- Do not introduce a second testing framework or replace current Vitest patterns.
- Do not force UI-heavy tests where narrower data-boundary tests provide better signal.
- Do not invent auth-flow test harnesses before auth feature code exists in the repository.

## Decisions

### 1. Extend existing `contract-aligned-test-suite` capability

Reason:
- Existing spec already owns automated test expectations.
- Request is about coverage depth, not new runtime product capability.

Alternative considered:
- Create a new standalone testing capability.
- Rejected because it would split one quality contract across two specs and duplicate ownership.

### 2. Define coverage by business-risk slice, not by generic percentage target

Reason:
- Project contract is business-rule heavy.
- Direct tests for contract writes, remuneration scope, dashboard totals, employee queries, and audit-log queries give better protection than a raw coverage threshold.

Alternative considered:
- Add a minimum coverage percentage requirement.
- Rejected because it can reward shallow tests and does not map cleanly to documented business truth.

### 3. Keep new coverage feature-local and boundary-specific

Reason:
- Repository conventions already prefer colocated feature tests.
- Business issues are easiest to diagnose when tests sit near the owning slice.

Alternative considered:
- Centralize new business tests in a shared integration folder.
- Rejected because it weakens feature ownership and duplicates the current slice pattern.

### 4. Prioritize server/data boundaries for critical workflows

Reason:
- Most uncovered risk sits in Prisma-backed queries, aggregate writes, scope enforcement, and derived financial state.
- These tests verify actual business invariants with less brittleness than broad UI tests.

Alternative considered:
- Focus first on component rendering coverage.
- Rejected because rendering is not where the biggest business-risk gaps currently live.

## Risks / Trade-offs

- More test volume can slow local runs -> Keep tests focused, deterministic, and mock-driven at the feature boundary.
- Over-specifying tests can freeze implementation details -> Write requirements around protected behavior and ownership boundaries, not private helper structure.
- Auth coverage remains an explicit documentation gap until auth feature code exists -> Handle that work in a separate auth-focused change rather than weakening this test change with speculative harnesses.
