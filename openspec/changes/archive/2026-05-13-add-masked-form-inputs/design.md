## Context

The shared form system registers reusable field components in `useAppForm`, and feature forms consume them through `form.AppField` render props. Client forms currently use the generic text input for both document and phone fields, while only the document schema strips mask characters before persistence. This change adds a new shared field component and a new external masking dependency, so the implementation needs one explicit design to keep vendor usage isolated and preserve the documented form boundary.

## Goals / Non-Goals

**Goals:**
- Add one reusable masked input field that plugs into the existing shared TanStack Form registry.
- Keep vendor-specific masking logic inside the shared layer instead of leaking library APIs into features.
- Support built-in masks for CPF, CNPJ, and Brazilian phone numbers with visible `maxLength` values that match the rendered masks.
- Preserve normalized persisted values for client document and phone fields.

**Non-Goals:**
- Add masking to OAB inputs.
- Reformat list or detail display surfaces outside the affected form inputs.
- Introduce a generic free-form masking DSL across the app in this change.

## Decisions

### Add `FormInputMask` as a shared field component
The new component will live under `src/shared/components/form` and be registered as `InputMask` in `useAppForm`. This keeps the route and feature API identical to existing shared fields and avoids a second form pattern.

Alternative considered:
- Use `field.Input` plus feature-local masking handlers. Rejected because it would duplicate vendor integration and `maxLength` rules across features.

### Encapsulate `use-mask-input` behind built-in `maskKind` values
The shared component will accept a narrow `maskKind` union such as `cpf`, `cnpj`, and `phoneBr`, then map each kind to mask configuration and visible `maxLength`. This preserves a stable internal contract even if the masking library changes later.

Alternative considered:
- Pass raw mask strings from features. Rejected because it spreads vendor-specific syntax into feature code and weakens consistency for `maxLength`.

### Keep normalization authoritative in feature schemas
Client document normalization already happens in the client form schema, and phone normalization will be added there as well. The masked field may emit masked text during interaction, but persistence still depends on schema normalization, which matches the documented validation boundary.

Alternative considered:
- Rely only on mask-library unmasking. Rejected because schema-level normalization remains the canonical repository pattern and protects server-facing writes even if the field implementation changes later.

### Support Brazilian phone masks with one shared longest `maxLength`
The phone mask will use the Brazilian mobile-visible default `(99) 99999-9999`, and the shared config will expose the visible longest `maxLength` for the selected phone format. This keeps the field predictable for users and avoids making feature consumers reason about mask syntax.

Alternative considered:
- Use the spaced mobile format `(55) 9 9680 3681`. Rejected because the hyphenated format matches the existing product documentation example and is a more familiar phone rendering pattern in this codebase.

## Risks / Trade-offs

- `use-mask-input` adds a new frontend dependency. → Mitigation: isolate it behind the shared field component and avoid direct feature imports.
- Masked interaction can diverge from persisted values. → Mitigation: normalize client document and phone values in the schema before mutation submission.
- Alternating phone masks can make `maxLength` behavior inconsistent if handled ad hoc. → Mitigation: store `maxLength` beside each built-in mask config and apply it automatically in the shared component.
- Controlled-input masking can be brittle with form libraries. → Mitigation: use the library's TanStack Form integration API instead of custom ref wiring.

## Migration Plan

1. Add `use-mask-input` dependency.
2. Implement the shared masked field and register it in `useAppForm`.
3. Apply the field to client document and phone inputs.
4. Normalize phone input in the client schema and add focused tests.
5. Run `pnpm check` and `npx tsc --noEmit`.

Rollback is straightforward: revert the shared field registration, client form usage, and dependency addition. No data migration is involved.

## Open Questions

- None. Scope is limited to shared client form behavior, and OAB is intentionally excluded.
