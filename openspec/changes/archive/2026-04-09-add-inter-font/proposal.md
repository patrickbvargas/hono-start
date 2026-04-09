## Why

The HeroUI theme already wires `--font-sans` to `var(--font-inter)`, and the Google Fonts stylesheet for Inter is loaded in the app shell — but `--font-inter` is never defined as a CSS variable. As a result, no font family is actually applied and the browser falls back to the system sans-serif.

## What Changes

- Define `--font-inter` as a CSS custom property in `:root` so the HeroUI theme variable chain resolves correctly.
- Ensure `font-family` is explicitly applied to `body` via Tailwind's `font-sans` utility so Inter renders across the entire app.

## Capabilities

### New Capabilities
- `inter-font`: Wires the Inter typeface loaded from Google Fonts into the HeroUI CSS variable chain so all text in the app renders in Inter.

### Modified Capabilities

## Impact

- `src/styles/global.css` — add `--font-inter` definition to `:root`.
- `src/routes/__root.tsx` — already loads the Google Fonts stylesheet; no changes required there.
- No API, database, or multi-tenant implications.
