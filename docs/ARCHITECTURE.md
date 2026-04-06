# Hono — Legal Fee Management System

## Architecture Document

> **Version:** 1.0 — 2026

---

## Project Structure

```
src/
├── db/                  # Database client and Prisma schema definitions
├── features/            # Feature slices — one per domain entity
│   └── <feature>/
│       ├── api/         # Server functions and query/mutation option factories
│       ├── components/  # Feature-scoped UI components
│       ├── constants/   # Cache keys and other feature-level constants
│       ├── hooks/       # Feature-scoped React hooks
│       ├── schemas/     # Zod schemas for this feature
│       ├── utils/       # Pure helper functions
│       └── index.ts     # Public barrel — the only allowed import path for this feature
├── routes/              # TanStack file-based route definitions
├── shared/              # Cross-feature reusable code
│   ├── components/
│   │   ├── ui/          # HeroUI re-exports (never import HeroUI directly in features)
│   │   └── form/        # Reusable form field components
│   ├── hooks/           # Shared hooks (e.g. usePagination, useSort, etc.)
│   ├── lib/             # Utilities, formatters, error helpers
│   ├── schemas/         # Shared Zod schemas (e.g. pagination, sort, etc.)
│   └── types/           # Shared TypeScript types
└── styles/              # Global styles entry point
```

---

## Architectural Rules

**Feature isolation.** All domain code lives inside its feature slice. Features communicate only through their public `index.ts` barrel — never by importing internal paths of another feature.

**UI library abstraction.** Features and routes must never import directly from `@heroui/*`. Components and their prop types are re-exported from `shared/components/ui/`; hooks from `shared/hooks/`. This decouples features from the UI library.
