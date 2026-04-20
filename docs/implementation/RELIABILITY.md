# Reliability

## Validation Boundary

- All server-facing inputs must be validated before business logic executes.
- Form schemas validate request shape and database-free cross-field rules before business logic executes.
- Input normalization remains separate from business validation and must be applied consistently by the consuming schema or server handler.
- Business constraints must be enforced consistently at the service or server-function boundary.
- Lookup-backed selections that require Prisma or persisted-state checks must be resolved and validated at the server-function boundary rather than inside form schemas.
- Invalid state transitions must fail with user-friendly pt-BR messages.
- URL-driven list state must be validated before it reaches queries.

## Error Handling

- Database and infrastructure failures must be logged server-side with actionable context.
- User-facing errors must remain safe and comprehensible.
- Do not leak stack traces, SQL details, or internal exception messages to the UI.

## Transaction Rules

- Multi-table writes must execute atomically.
- Cascade delete and restore flows must execute inside transactions.
- Partial writes that can break business invariants are forbidden.

## Determinism Rules

- Paginated queries require deterministic ordering.
- Sorting behavior must include a stable tiebreaker.
- Repeated requests with the same inputs must produce the same logical result.
- Query refresh after successful mutations must preserve list consistency.

## Definition Of Done

A task is not complete until:

- code follows the documented architecture and conventions
- business rules remain intact
- `pnpm check` passes
- `npx tsc --noEmit` passes
- relevant docs stay aligned when the intended behavior or house pattern changes

## Quality Rule

- Do not leave known type or lint errors behind.
- Do not paper over failures with undocumented exceptions or suppressions.

## Reference Quality Signals

- Routes remain thin and declarative.
- Feature slices remain internally cohesive.
- Mutations refresh the right cache domain after success.
- Form defaults, validation, and submission behavior are consistent across entities.
