## Why

Expense workspaces expose a placeholder Financeiro tab even though payable generation already exists on the server. Operators need the same installment planning and inspection flow available for contract revenues.

## What Changes

- Replace the expense financial placeholder with negotiated amount, generation state, payment totals and expandable titles.
- Reuse the contract generation form and automatic editable preview for expenses.
- Authorize generation options for the selected direction and preserve source-specific server authorization.
- Derive expense balances from principal abated by unreversed payments, preserving decimal precision.
- Restore the financial status chip in revenue and expense card headers; derive contract debt from principal rather than effective cash, including overdue entries.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `expense-payable-generation`: Generate and inspect payable installments from the expense Financeiro tab using the contract visual flow.

## Impact

Affected slices: expenses and financial-titles, with compatibility for contract consumers. Admin operators retain explicit expense-write and payable-generation grants; Members remain denied. Reads and writes remain scoped to the authenticated Firm. No new dependencies or database changes.

## Non-goals

Payment registration, regeneration, debt cancellation, remuneration, and settlement writes are outside this change.
