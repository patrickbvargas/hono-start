# Spec: title-settlements

## Purpose

Support authorized individual financial settlements and immutable reversals from title pages and summaries, with atomic remuneration, audit and concurrency protection.

## Requirements

### Requirement: Contextual individual settlement
The system SHALL offer a modal to register a receipt or payment from its title page and summary, without new routes. Active titles with positive balance SHALL support full or partial principal, discount, interest, penalty, effective date and actual payment method. Cash SHALL equal principal minus discount plus interest plus penalty.

#### Scenario: Partial settlement
- **WHEN** an authorized operator settles 40 of a title with balance 100 and discount 5
- **THEN** balance becomes 60 and recorded cash equals 35

#### Scenario: Invalid financial input
- **WHEN** principal exceeds current balance, discount exceeds principal, date is future, or title is cancelled
- **THEN** the operation fails without writing financial events or audit records

### Requirement: Immutable reversal
The system SHALL offer reversal on each confirmed movement, including partially settled titles. Reversal SHALL require a reason and a non-future date no earlier than the original settlement. The original event SHALL remain unchanged, with principal restored and cash reversed on the reversal date.

#### Scenario: Reversal of one partial payment
- **WHEN** an administrator with reversal grant reverses one payment
- **THEN** only its principal is restored and its original record remains visible as reversed

### Requirement: Atomic remuneration
Contract receipts with remuneration enabled and positive cash SHALL generate eligible team payables and immutable rule snapshots in the same transaction. Due dates SHALL use the Firm cutoff/due days and clamp nonexistent month days. Zero cash SHALL generate no remuneration.

#### Scenario: Dependent payable has active payment
- **WHEN** a receipt reversal has any generated remuneration payable with a non-reversed payment
- **THEN** reversal fails without changes and requests prior reversal of team payments

#### Scenario: Dependent payments reversed
- **WHEN** all payments of generated remuneration are reversed
- **THEN** receipt reversal cancels generated payables atomically

### Requirement: Authorization and reliability
The system SHALL enforce session-derived Firm and actor, explicit grants, assigned-contract Member receipt scope, administrator-only payments/reversals, transactional audit, and concurrency-safe balance checks. Identical requests with the same key SHALL be idempotent; changed payloads SHALL fail.

#### Scenario: Cross-firm or unauthorized request
- **WHEN** an operator submits another Firm's title or a forbidden action
- **THEN** the server rejects the request without writing records

#### Scenario: Concurrent settlements and retries
- **WHEN** requests compete for the same remaining balance or repeat a confirmed request
- **THEN** total active principal never exceeds face amount and a repeated request creates no duplicate event

