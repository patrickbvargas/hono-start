# Hono Documentation Index

This directory is the canonical project contract for Hono.

If the codebase is incomplete, outdated, or inconsistent, these docs still describe the intended truth of the project.

## Who This Is For

This documentation set is written for:

- AI agents implementing or reviewing work
- new developers onboarding to the project
- maintainers validating whether code still matches intended product and repository rules

## Contract Structure

The contract is split into two layers:

- `docs/domain/` defines business truth, product behavior, permissions, workflows, and edge cases.
- `docs/implementation/` defines how this repository must realize that truth.

## How To Use This Contract

Read in order.

Do not infer project truth from incomplete code when the docs already define it.

When a question is answered by a more specific file, prefer that file over a broader summary.

## Reading Order

1. `docs/domain/PRODUCT_SENSE.md`
2. `docs/domain/DOMAIN_MODEL.md`
3. `docs/domain/BUSINESS_RULES.md`
4. `docs/domain/ROLES_AND_PERMISSIONS.md`
5. `docs/domain/FEATURE_BEHAVIOR.md`
6. `docs/domain/LOOKUP_VALUES.md`
7. `docs/domain/QUERY_BEHAVIOR.md`
8. `docs/domain/USER_FLOWS.md`
9. `docs/domain/EDGE_CASES.md`
10. `docs/domain/SUCCESS_CRITERIA.md`
11. `docs/domain/GLOSSARY.md`
12. `docs/implementation/ARCHITECTURE.md`
13. `docs/implementation/DATA_ACCESS.md`
14. `docs/implementation/CONVENTIONS.md`
15. `docs/implementation/FRONTEND.md`
16. `docs/implementation/SECURITY.md`
17. `docs/implementation/QUALITY_WORKFLOW.md`

## Conflict Resolution

- Domain docs win on business meaning, product behavior, and permissions.
- Implementation docs win on stack, structure, naming, code organization, and repository patterns.
- If code disagrees with docs, docs describe intended truth.
- If two docs overlap, the more specific doc wins over the broader summary.

Specificity guidance:

- `BUSINESS_RULES.md` beats broad statements in `FEATURE_BEHAVIOR.md`
- `ROLES_AND_PERMISSIONS.md` beats broad visibility statements in other domain files
- `QUERY_BEHAVIOR.md` beats generic list-language elsewhere
- `FRONTEND.md`, `CONVENTIONS.md`, and `ARCHITECTURE.md` beat broad implementation summaries elsewhere

## Ownership Rules

- Put reusable product and domain truth in `docs/domain/`.
- Put repository-specific technical rules in `docs/implementation/`.
- Avoid duplicating normative rules across multiple files.
- Use summary files to point to canonical rule files instead of restating them.

## Agent Guidance

When implementing or reviewing work:

1. Read this index first.
2. Read the files in order.
3. Treat undefined behavior as a documentation gap, not a license to invent a new pattern.
4. Preserve existing contract language unless the project truth is intentionally changing.
5. If a change alters project truth, update the docs in the same work.

## Contributor Execution Checklist

Before starting non-trivial work:

1. Read `docs/index.md`.
2. Read the canonical files in order.
3. Identify which file owns each question you need answered.
4. Treat missing behavior as a documentation gap, not as permission to invent a new pattern.

While implementing:

1. Keep domain behavior aligned with `docs/domain/`.
2. Keep repository shape and coding patterns aligned with `docs/implementation/`.
3. Avoid adding duplicate rule text to a second file when one file already owns that rule.
4. Preserve canonical terminology from `docs/domain/GLOSSARY.md`.

Before finishing:

1. Check whether project truth changed.
2. If truth changed, update the owning documentation file in the same work.
3. Verify the implementation still matches the documented stack, architecture, permissions, and behavior.

## Human Reading Aid

For a human-oriented explanation of what each file is for, see:

- `docs/HELP_READING_GUIDE.md`

That guide is supportive commentary. This file remains the canonical entrypoint.
