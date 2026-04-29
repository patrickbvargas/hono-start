## 1. Route gating

- [x] 1.1 Move protected `_app` session enforcement from `loader` to `beforeLoad`
- [x] 1.2 Move authenticated-user redirects on `/login` and `/recuperar-senha` from `loader` to `beforeLoad`
- [x] 1.3 Preserve requested protected destination in login redirect search state with internal-path validation

## 2. Session flow alignment

- [x] 2.1 Update shared session helpers and login navigation flow to consume the preserved redirect safely
- [x] 2.2 Add or update tests for protected-route redirect, authenticated public-route redirect, and post-login destination restoration
- [x] 2.3 Run `pnpm check` and `npx tsc --noEmit`
