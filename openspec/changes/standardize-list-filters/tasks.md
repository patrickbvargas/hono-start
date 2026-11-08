## 1. Shared Components Foundation

- [x] 1.1 Support active filter count badge or indicator on `ListFilters.Popover` and `ListFilters.Drawer`
- [x] 1.2 Ensure `ListFilters.Bar` and `EntityView.Toggle` support clean `ml-auto` right-alignment

## 2. Standardize Feature Filters

- [x] 2.1 Standardize `ContractFilter` (/contratos): Single popover with count, right-aligned toggle, active chips with inline clear
- [x] 2.2 Standardize `ReceivableFilter` (/contas-a-receber): Single popover with count, right-aligned toggle, active chips with inline clear, period shortcuts
- [x] 2.3 Standardize `PayableFilter` (/contas-a-pagar): Single popover with count, right-aligned toggle, active chips with inline clear, period shortcuts
- [x] 2.4 Standardize `PersonFilter` (/pessoas): Single popover with count, right-aligned toggle, active chips with inline clear
- [x] 2.5 Standardize `ExpenseFilter` (/despesas): Single popover with count, right-aligned toggle, active chips with inline clear, period shortcuts
- [x] 2.6 Standardize `AuditLogFilter` (/auditoria): Single popover with count, right-aligned toggle, active chips with inline clear

## 3. Verification & Quality

- [x] 3.1 Run tests, biome checks, and typescript compiler (`pnpm check`, `npx tsc --noEmit`) to verify zero regressions
