# Stack

## Fixed Choices

These technical choices are mandatory for this repository:

- Framework: TanStack Start
- Routing: TanStack Router
- Async state and cache: TanStack Query
- Forms: TanStack Form
- Tables: TanStack Table
- ORM: Prisma
- Database: PostgreSQL
- File storage: Supabase Storage
- Authentication: BetterAuth
- UI components: HeroUI via shared re-exports only
- Validation: Zod
- Linting and formatting: Biome
- Testing: Vitest and Testing Library
- Language: TypeScript with strict mode
- Package manager: pnpm

## Stack Contract

- Contributors must not substitute these libraries without first updating this document and the broader implementation contract.
- New abstractions must fit the current stack rather than bypass it.
- The stack is part of the repository identity, not an optional detail.
- The stack rules are intended to be reusable across projects even when the domain layer changes.

## Open Technical Choice

- Delivery providers for email-based authentication or notification flows remain an explicit project-level choice until a repository fixes one.
