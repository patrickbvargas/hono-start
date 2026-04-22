## Why

The project has moved its shared UI direction from HeroUI to shadcn/ui, but the documentation surface is not yet coherent. The implementation docs already name shadcn/ui as the fixed shared UI component layer, while other current project guidance and OpenSpec specs still hard-code HeroUI details such as the HeroUI React v3 agent docs index, `ListBox`, and `Drawer`.

This creates avoidable drift for future agents and contributors: the stack contract says shadcn/ui, but some docs still instruct readers to use HeroUI-specific APIs and docs before any task.

## What Changes

- Update contributor and agent-facing documentation so shadcn/ui is the documented UI foundation.
- Remove or replace stale HeroUI React v3 guidance from current project instructions.
- Audit `docs/`, `AGENTS.md`, and current `openspec/specs/` for live HeroUI references.
- Update current OpenSpec specs that mention HeroUI implementation details to describe the shared UI contract and shadcn/ui-backed implementation direction instead.
- Preserve historical archived OpenSpec changes unless a current contract file links to them as active guidance.

## Capabilities

### Modified Capabilities

- `app-layout`: replace HeroUI-specific mobile drawer language with shared UI drawer language.
- `sidebar-nav`: replace HeroUI `ListBox` selection and keyboard language with shared navigation component language backed by accessible shared UI primitives.

## Impact

- Affected docs: `AGENTS.md`, `docs/implementation/*`, and current `openspec/specs/*`.
- Affected specs: `app-layout`, `sidebar-nav`.
- Affected code: none intended.
- Affected roles: contributors and AI agents following repository instructions.
- Multi-tenant impact: none; this is documentation-only.

## Non-goals

- Do not implement UI migration code.
- Do not remove HeroUI dependencies.
- Do not rewrite archived OpenSpec history.
- Do not change domain behavior, permissions, data access, route workflows, or product copy.
- Do not introduce a second feature-level UI import path; feature and route code still consumes `@/shared/components/ui`.
