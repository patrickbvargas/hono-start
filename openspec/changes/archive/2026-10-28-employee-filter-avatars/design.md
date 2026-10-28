## Context

Employee options currently carry IDs and names. Clerk alone owns photos and the optional user.privateMetadata.employeeId binding. Employees are company-wide; protected option handlers already enforce access and Firm-specific option eligibility. The shared autocomplete exposes renderOption and supports input adornments through shared UI.

## Goals / Non-Goals

**Goals:** recognizable filter options and selected collaborators, consistent initials fallback, server-only metadata resolution, bounded refresh and graceful provider failure.

**Non-Goals:** account management, photo persistence, changing eligible options, form/table redesign or changing grants.

## Decisions

- Authentication owns a server-only enrichment helper exported through its public barrel. Existing protected option API handlers invoke it after authorization and data selection. Database queries and eligibility remain unchanged.
- Read paginated Clerk users in stable creation order and resolve positive integer privateMetadata.employeeId bindings. Cache only employee-to-photo URLs for 60 seconds in-process and deduplicate concurrent loads. No per-option provider requests. Failed loads return initials and retry after a short 10-second cooldown. This display cache never participates in authorization.
- Missing photos, malformed bindings/URLs and duplicate bindings produce fallback. Do not choose an arbitrary account when multiple users point to the same employee.
- Extend the explicit shared option schema with optional imageUrl, validating enriched output with Zod. Expose neither Clerk identifiers nor private metadata.
- Reuse Avatar, AvatarImage and AvatarFallback through shared UI. A shared collaborator renderer supplies option rows and selected-avatar adornments; filter callers opt in explicitly so other autocompletes retain their behavior.
- Employee option query factories use 60-second staleTime so focus/navigation can refresh photos. Search, IDs, labels, keyboard selection and clear behavior stay unchanged.
- Clerk SDK pagination and User fields verified through Context7 official Clerk documentation. No stack deviations or dependencies.

## Risks / Trade-offs

- Instance-wide user lookup grows with account count → pagination, deduplicated short cache and graceful fallback; company-wide Employee scope requires resolving bindings across Organizations.
- Photos/bindings can lag up to cache refresh → short TTL, never use display metadata for permission decisions.
- Process cache is per worker → acceptable for optional decoration; no new infrastructure.
- Provider outage → discard partial results and return unchanged options without photos.

## Migration Plan

Deploy application files only; no schema migration or backfill. Roll back code to restore text-only filters.

## Open Questions

None.
