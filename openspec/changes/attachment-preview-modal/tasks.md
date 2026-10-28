## 1. Preview data and orchestration

- [x] 1.1 Add protected binary query options and preview lifecycle hook with safe failures, retry, cancellation and URL cleanup. No database migration required.
- [x] 1.2 Wire preview through the section's existing overlay pattern and close it after successful confirmed deletion.

## 2. Presentation

- [x] 2.1 Add responsive shared-UI preview modal with fixed metadata/actions header, native PDF display, fitted images and fallback actions.
- [x] 2.2 Make attachment identity a keyboard-accessible preview trigger while preserving independent download and menus; add Visualizar to both menus and padded, vertically centered row hover.

## 3. Verification and contract

- [x] 3.1 Add focused tests for PDF/images, failure/retry, resource cleanup, permissions, independent actions and preview/deletion lifecycle.
- [x] 3.2 Update attachment behavior docs and run focused tests, pnpm check and npx tsc --noEmit; record native PDF browser verification limits.

## Validation results

## PDF reader refinement

- [x] 4.1 Add PDF.js with local worker/font/CMap/WASM assets, lazy engine loading and a bounded one-page canvas renderer.
- [x] 4.2 Share the floating zoom toolbar between images and PDFs; add PDF pagination, fit-to-width and native print fallback.
- [x] 4.3 Verify PDF/image controls, worker cleanup, safe failures, print preparation, TypeScript and production packaging; check a real PDF in the browser.

PDF refinement verification: 21 PDF/image/overlay tests and 3 print tests passed. Production build packaged the engine, worker and supporting assets successfully. A real PDF rendered in the browser with the shared toolbar and working zoom. Canvas reading intentionally omits selectable text/search/annotations; new-tab native reading remains available.

- `openspec validate attachment-preview-modal --strict`: passed.
- `pnpm check`: passed.
- `npx tsc --noEmit`: passed.
- `pnpm test src/features/attachments`: 115 tests passed before the final loading-through-render adjustment.
- Final focused run of preview, preview-overlay and context-menu suites: 21 tests passed, including the final skeleton-through-load behavior and menu previews.
- Real browser: verified the padded row controls, Visualizar menu and opening the PDF modal on contract 200. PDF content remained blank in the in-app browser's native embed; the open-in-new-tab alternative remains available. Subsequent image browser inspection timed out, so successful native PDF rendering/controls and final image layout were not visually verified. Automated tests cover their wiring and loading behavior.
