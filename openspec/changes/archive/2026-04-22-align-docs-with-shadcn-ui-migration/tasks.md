## 1. Documentation Audit

- [x] 1.1 Search live project documentation for HeroUI references in `AGENTS.md`, `docs/`, and `openspec/specs/`.
- [x] 1.2 Classify each HeroUI reference as current contract drift, historical archived context, or temporary migration note.
- [x] 1.3 Confirm domain docs do not need changes because the UI library swap is presentational infrastructure only.

## 2. Agent And Implementation Docs

- [x] 2.1 Replace stale HeroUI React v3 agent guidance in `AGENTS.md` with shadcn/ui-oriented guidance.
- [x] 2.2 Ensure `docs/implementation/STACK.md` names shadcn/ui as the fixed UI component layer.
- [x] 2.3 Ensure `docs/implementation/CONVENTIONS.md` keeps feature and route UI imports behind `@/shared/components/ui`.
- [x] 2.4 Ensure `docs/implementation/FRONTEND.md` describes shadcn/ui shared-layer rules and temporary `Hui` compatibility accurately.

## 3. OpenSpec Specs

- [x] 3.1 Update `openspec/specs/app-layout/spec.md` so mobile drawer requirements do not name HeroUI.
- [x] 3.2 Update `openspec/specs/sidebar-nav/spec.md` so navigation item, active state, and keyboard requirements do not depend on HeroUI `ListBox`.
- [x] 3.3 Keep requirements behavioral: what the user experiences, not which old vendor primitive provided it.

## 4. Verification

- [x] 4.1 Run `rg -n "HeroUI|heroui|@heroui|Hero UI" AGENTS.md docs openspec/specs`.
- [x] 4.2 Verify any remaining matches are intentional temporary migration notes or historical references outside live specs.
- [x] 4.3 Run `openspec validate align-docs-with-shadcn-ui-migration --strict`.

## Notes

- Code changes intended: No.
- Database migrations required: No.
- Archived OpenSpec changes may continue mentioning HeroUI as historical record.
