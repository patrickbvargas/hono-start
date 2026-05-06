## Context

The shared `FormRoot` wrapper follows the TanStack Form pattern of intercepting `onSubmit` and delegating to `form.handleSubmit()`. That works after hydration, but the rendered HTML currently omits an explicit `method`, which means browsers default to `GET` for native fallback submission. On the public authentication screens, a pre-hydration submit or JavaScript failure can therefore serialize password-bearing fields into the URL.

This change is cross-cutting because the secure fallback should be established at the shared form boundary rather than patched ad hoc inside each authentication component. The authentication feature remains the primary stakeholder because its public forms carry secrets.

## Goals / Non-Goals

**Goals:**
- Ensure public authentication forms do not place password-bearing fields into the browser URL during native browser fallback conditions.
- Keep the existing TanStack Form orchestration pattern intact after hydration.
- Add focused contract tests around the shared form boundary so regressions are caught centrally.

**Non-Goals:**
- Replacing TanStack Form or the shared app-form pattern.
- Redesigning login or password-reset user experience.
- Changing BetterAuth request handling or protected-route behavior.

## Decisions

### Decision: Set a safe native submission default at the shared form root
`FormRoot` will render with `method="post"` by default while still intercepting `onSubmit` and calling `form.handleSubmit()`. This preserves current hydrated behavior and hardens the no-JS / pre-hydration fallback.

Alternative considered:
- Patch only authentication forms with `method="post"` props. Rejected because the leak source is the shared primitive and per-screen fixes are easier to miss in future secret-bearing forms.

### Decision: Preserve caller override capability
The shared form root will apply the secure default through normal prop composition so existing callers can still override `method` if a future non-auth use case requires a different native behavior intentionally.

Alternative considered:
- Hard-code `method="post"` with no override. Rejected because it is unnecessarily rigid for a shared abstraction.

### Decision: Verify the boundary with a shared component test
Add a focused Vitest test for `FormRoot` that asserts the rendered native form uses `POST` by default and still respects an explicit caller override. This keeps the regression test near the source of truth.

Alternative considered:
- Test only authentication components. Rejected because those tests would not prove the shared primitive stays safe for every consumer.

## Risks / Trade-offs

- Shared default changes native browser fallback semantics for all forms → Mitigation: use standard HTML `POST`, which is compatible with current JavaScript-intercepted flows and safer for sensitive forms.
- A future caller may intentionally expect native `GET` fallback → Mitigation: preserve prop override support and cover it in tests.
- This does not scrub already-leaked URLs from browser history → Mitigation: fix forward by preventing new leaks at submission source; broader remediation is outside this change.
