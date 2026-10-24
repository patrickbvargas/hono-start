## Why

The application needs a final contract and release verification pass. Stale setup documentation and incomplete quality-tool coverage make successful source checks insufficient evidence for deployment.

## What Changes

- Audit feature naming, ownership and boundaries using the existing contract tests.
- Reconcile setup, persistence and security documentation with the current application.
- Include root tooling configuration in formatting and lint verification and provide a reproducible read-only release check.
- Record automated results and deployment checks that require a real operator session.
- Preserve current audit sorting and document the distinction between schema fallback and URL defaults.
- Preserve the remuneration table without a subtotal footer and align stale tests/specification with the user's current code.

## Capabilities

### New Capabilities
- `release-readiness`: Repeatable release verification and explicit operational prerequisites.

### Modified Capabilities
None. Existing product behavior is preserved.

## Impact

Quality configuration, package scripts, README and implementation docs. All user roles benefit from consistent deployment verification; permission grants and firm isolation remain unchanged. No database migrations required.

## Non-goals

No stack migration, new business workflows, production database changes, deployment or authentication administration.
