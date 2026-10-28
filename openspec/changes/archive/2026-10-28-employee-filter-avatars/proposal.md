## Why

Collaborator filters currently show names only. Profile photos help users recognize linked collaborators while initials keep unlinked collaborators identifiable.

## What Changes

- Show Clerk photos beside collaborator names in Dashboard, Contracts, Remunerations and Pending Work filter options.
- Use name initials for missing links, absent photos, broken images or provider unavailability.
- Resolve photos server-side with short-lived caching; preserve all existing option eligibility and permission rules.

## Capabilities

### New Capabilities
- `employee-filter-avatars`: Consistent collaborator photos and fallback in existing filters.

### Modified Capabilities
None.

## Impact

Shared filter rendering, collaborator option queries, Clerk read integration and frontend contracts. Applies to any user already permitted to use these filters. Employees remain company-wide; operational Firm scopes and access grants remain unchanged. No dependencies or database migrations.

## Non-goals

Account administration, avatar uploads, Employee photo persistence, permission changes, and redesigning collaborator forms or tables.
