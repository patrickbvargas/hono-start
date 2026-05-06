## Context

Shared entity UI already centralizes `FormSection` and `EntityDetail.Section`, but each component owns its own title typography. Both components solve the same problem: label a semantic section inside entity forms and detail drawers. Because the styling is duplicated, equivalent surfaces drifted apart.

## Goals / Non-Goals

**Goals:**
- Centralize section-title typography in one shared primitive.
- Make `FormSection` and `EntityDetail.Section` render the same visual title treatment by default.
- Preserve current layout responsibilities for descriptions, actions, and section content.

**Non-Goals:**
- Introduce a broader typography system refactor.
- Change field spacing, separators, or container composition outside the title element.
- Move feature-owned section behavior out of existing shared wrappers.

## Decisions

### Create a shared `SectionTitle` component under `src/shared/components`
Use a shared component because the same title contract already appears in more than one shared wrapper. This matches the repository rule to extract repeated stable UI contracts into `shared/`.

Alternative considered:
- Keep duplicated class strings in each component. Rejected because it preserves drift risk and makes future style changes require multiple edits.

### Keep wrapper ownership in `FormSection` and `EntityDetail.Section`
Only the title presentation is shared. `FormSection` still owns description/action layout and field grouping, while `EntityDetail.Section` still owns drawer section structure and override hooks.

Alternative considered:
- Replace both wrappers with a single generic section container. Rejected because the surrounding layout contracts are still different and do not justify a larger abstraction.

### Support local class overrides on top of shared defaults
The shared title component will accept `className` so existing `EntityDetail.Section` override points continue to work without reintroducing duplicate base styles.

Alternative considered:
- Hard-code styles with no overrides. Rejected because `EntityDetail.Section` already exposes section title customization hooks.

## Risks / Trade-offs

- Override classes may partially diverge again if callers replace core typography aggressively. → Mitigation: keep shared defaults in the base component and only layer overrides on top.
- Slight typography change may affect snapshots or visual expectations in tests. → Mitigation: run focused checks and keep markup minimal.
- Shared extraction could be premature if used only twice. → Mitigation: both usages are in shared abstractions already, so the contract is stable enough for extraction.
