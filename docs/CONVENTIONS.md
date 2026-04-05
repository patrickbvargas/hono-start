# Hono — Legal Fee Management System

## Conventions Document

> **Version:** 1.0 — 2026

---

## Language Policy

- **UI and user-facing content**: Portuguese (pt-BR) — labels, messages, validation errors, empty states, toasts
- **Codebase**: English — variable names, function names, file names, comments, server logs

---

## Code Patterns

**Data formatting.** All data-to-UI transformations (currency, dates, percentages, documents) must go through shared formatter functions in `shared/lib/`. Never format inline in components.

---

## UI Patterns

**Entity details** — displayed in a slide-in drawer, never on a dedicated page.

**Create and edit forms** — displayed in a modal overlay, never on a dedicated page.

**Data tables** — filter, sort, and pagination state are URL-driven.
