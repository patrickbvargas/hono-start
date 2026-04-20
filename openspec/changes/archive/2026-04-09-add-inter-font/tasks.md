## 1. CSS Variable Setup

- [x] 1.1 Add `--font-inter: "Inter", sans-serif;` to the `:root` block in `src/styles/global.css`

## 2. Apply Font to Body

- [x] 2.1 Add `font-family: var(--font-sans);` to the `body` selector in `src/styles/global.css`

## 3. Verify

- [x] 3.1 Run `pnpm dev` and confirm Inter renders in the browser (check DevTools → Computed → font-family on `body`)
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit` — fix any errors before marking done
