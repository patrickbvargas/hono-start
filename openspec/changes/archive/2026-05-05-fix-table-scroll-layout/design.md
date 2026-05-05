## Context

Authenticated list routes already follow the documented `Wrapper`, `Wrapper.Header`, and `Wrapper.Body` composition, and feature tables already consume the shared `DataTable` with shared pagination. The current issue comes from the scroll boundary being too high in the tree: `WrapperBody` uses a shared scroll area, so long tables move the whole page section instead of only the table content.

The safest fix is to preserve route composition and feature APIs while relocating the scroll boundary into the shared table component. That keeps the change small, cross-cutting, and consistent for every list route that already uses the house pattern.

## Goals / Non-Goals

**Goals:**
- Keep authenticated list pages fixed within the app shell without body-level scrolling for long tables.
- Let shared tables fill the available wrapper body height without overflowing their parent.
- Provide a sticky table header while rows and pagination scroll inside the table region.

**Non-Goals:**
- No feature-specific table rewrites.
- No change to server-driven pagination semantics or route search state.
- No introduction of new UI dependencies or virtualization behavior.

## Decisions

### Move the vertical scroll boundary from `WrapperBody` into `DataTable`
`WrapperBody` should become a flex container with `min-h-0` so children can shrink within the available height. The shared `DataTable` should own the scrollable viewport because it has the context needed to keep header, body, and pagination aligned as one bounded content region.

Alternative considered:
- Keep `WrapperBody` scrollable and try to pin headers inside each feature table. Rejected because it preserves the wrong scroll surface and would require repeated per-table work.

### Keep pagination inside the shared table scroll region
Pagination is already passed as shared footer content. Rendering it inside the same bounded table container preserves the user's place in the list and matches the requested behavior where scrolling belongs to the table content area, not the page body.

Alternative considered:
- Make pagination sticky outside the scroll area. Rejected because the request prefers pagination traveling with the content and this would introduce a second scrolling/sticky rule.

### Use CSS sticky behavior on the shared table header
The shared table primitives should own sticky header styling so every feature table gets the same behavior without reimplementing classes. The sticky surface needs a stable background and z-index to remain legible while rows scroll.

Alternative considered:
- Apply sticky classes in each feature table header definition. Rejected because it duplicates a shared layout concern across every table.

## Risks / Trade-offs

- [Risk] Flex-height layouts can fail if an ancestor does not expose `min-h-0` or `h-full`. → Mitigation: update the shared wrapper and table containers together so the scroll region has a bounded height path.
- [Risk] Sticky headers may visually blend with rows during scroll. → Mitigation: give the shared header a solid background and stacking context.
- [Risk] Some non-list usages of `WrapperBody` could rely on its old internal scroll area. → Mitigation: keep the wrapper API unchanged and scope the new overflow behavior to shared list/table composition.
