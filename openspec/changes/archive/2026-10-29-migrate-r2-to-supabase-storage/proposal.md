## Why

Replace the recently adopted Cloudflare R2 attachment backend with Supabase Storage at the user's request. Preserve attachment behavior and authorization while changing only file persistence infrastructure.

## What Changes

- **BREAKING**: Replace R2 configuration and transport with server-only Supabase Storage configuration and a private bucket.
- Preserve existing attachment keys, metadata, authorized delivery route, validation, audit and permanent deletion semantics.
- Define an explicit cutover procedure for existing objects, including verification and rollback before retiring R2.
- Update tests, environment examples, attachment documentation and the active D1 proposal's storage dependency.

## Capabilities

### New Capabilities

- `supabase-attachment-storage`: private attachment persistence, server-mediated access and verified provider cutover.

### Modified Capabilities

None. Existing attachment business requirements remain unchanged.

## Impact

Shared attachment storage adapter, environment validation, transport dependency, storage tests, seed compatibility and implementation documentation. All existing roles retain Clerk permissions; company-wide master attachments and Firm-scoped operational attachments retain their current access rules. Database provider changes remain owned by the separate D1 change.

## Non-goals

Replacing Clerk, migrating the database, redesigning attachment UI, exposing public object URLs, changing ownership paths, automatically deleting R2 resources or implementing a general multi-provider abstraction.
