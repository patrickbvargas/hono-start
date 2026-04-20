## Context

The HeroUI theme in `global.css` already references `var(--font-inter)` for `--font-sans`, and `__root.tsx` already loads the Inter font stylesheet from Google Fonts. The missing piece is the `--font-inter` CSS custom property definition — without it, the variable chain breaks and the browser falls back to the system sans-serif. This is a single-file CSS fix with zero architectural implications.

## Goals / Non-Goals

**Goals:**
- Define `--font-inter: "Inter", sans-serif` in the CSS `:root` block so the HeroUI variable chain resolves.
- Apply `font-family: var(--font-sans)` to `body` so Inter is used globally.

**Non-Goals:**
- Self-hosting the font (Google Fonts CDN is already in place and sufficient).
- Changing the font variant axes or weight range (the Google Fonts URL already covers `ital,opsz,wght` with full range).
- Introducing a new font package or build step.

## Decisions

**CSS variable over direct `font-family` declaration**
HeroUI's design token system relies on `--font-sans` being defined via `--font-inter`. Bypassing this chain (e.g., writing `font-family: "Inter"` directly on `body`) would work visually but diverge from the library's theming contract. Keeping `--font-inter` → `--font-sans` preserves future override ability.

**Google Fonts CDN (existing) over self-hosting**
The font is already loaded from Google Fonts with `display=swap` and full variable axes. Self-hosting adds build complexity for no measurable benefit in an internal app.

## Risks / Trade-offs

- **FOUC on slow networks** → Mitigated by `font-display: swap` already set in the Google Fonts URL.
- **Google Fonts availability** → Acceptable for an internal app; no offline requirement.

