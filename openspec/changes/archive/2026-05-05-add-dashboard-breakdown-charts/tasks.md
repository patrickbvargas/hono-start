## 1. Dashboard breakdown charts

- [x] 1.1 Create a feature-local breakdown chart component that renders `Receita por área` as a horizontal bar chart with shared tooltip support and pt-BR empty-state copy.
- [x] 1.2 Extend the same component set to render `Receita por tipo` as a donut chart with shared legend, tooltip, and formatted totals.
- [x] 1.3 Update the main dashboard composition to replace the legacy progress-list breakdown cards with the new chart cards while preserving the current layout and recent activity card.

## 2. Verification

- [x] 2.1 Add or update dashboard tests to cover the breakdown chart rendering paths and empty states without changing summary data contracts.
- [x] 2.2 Run `pnpm check`.
- [x] 2.3 Run `npx tsc --noEmit`.
