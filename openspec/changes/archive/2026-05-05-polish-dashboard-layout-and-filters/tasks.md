## 1. Dashboard layout polish

- [x] 1.1 Replace dashboard body native overflow with shared `ScrollArea` and preserve card spacing during scroll.
- [x] 1.2 Remove redundant top badge and keep summary surfaces rendered inside existing shared cards.

## 2. Filter and breakdown cleanup

- [x] 2.1 Move administrator employee selector out of advanced filters into the inline dashboard header area with matching width and shared UI.
- [x] 2.2 Simplify dashboard breakdown legend copy to show only percentage labels.

## 3. Verification

- [x] 3.1 Update focused dashboard component tests for the revised legend and scroll wrapper.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, then fix any issues before closing the change.
