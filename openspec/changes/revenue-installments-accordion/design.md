## Context

Contract revenues expose aggregate payment state but no receipt dates. Existing shared Base UI accordion supports accessible disclosure. Payment plans start one month after paymentStartDate; active fees uniquely identify recorded installments.

## Goals / Non-Goals

**Goals:** Show accurate schedule and recorded receipt information on demand, matching existing financial styling.

**Non-Goals:** No new payment rules, migrations or changes to receipt registration.

## Decisions

- Use shared Accordion, initially closed per revenue; avoid popovers and modal navigation for contextual details.
- Derive schedule server-side using decimal arithmetic and existing calendar month semantics; final installment absorbs rounding remainder.
- Extend validated revenue model with installment rows and nullable receipt dates; preserve existing aggregate values. Never fabricate down-payment receipt date.
- Display received, partial, pending and overdue states based on expected versus received amounts and calendar date. Overdue takes precedence for an unpaid balance.
- Gate disclosure with existing canReadFees and retain SensitiveValue for amounts. Existing contract scope remains authoritative.

## Risks / Trade-offs

- Long schedules increase card height → details remain closed by default and table scrolls horizontally on small screens.
- Legacy partial receipts consume installment slots → show remaining balance without changing mutation rules.
- Entry has no recorded receipt date → retain entry summary only.
