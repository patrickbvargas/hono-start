## Why

Audit descriptions are currently persisted in English and localized only when read. Observations must already be understandable in pt-BR in the database.

## What Changes

- Persist new audit descriptions in pt-BR at each existing mutation call site.
- Preserve operational action codes, entity types, names, identifiers and technical payloads.
- Document the persistence language and retain historical read compatibility.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-log-localization`: Require new audit descriptions to be persisted in pt-BR.

## Impact

Seven feature mutation modules and focused tests. Audit readers retain existing permissions; all firm scopes and transactions stay unchanged. No database migration or dependency changes.

## Non-goals

Translate action or entity codes, rewrite historical records, translate user-entered names, or modify technical payloads and existing UI wording.
