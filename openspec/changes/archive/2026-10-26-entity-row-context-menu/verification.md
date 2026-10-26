## Verification

- Focused interaction tests cover right-click and overflow action parity, persisted record identity, optional callbacks, authorization, deleted records, audit immutability, primary navigation, nested controls, keyboard access, Escape focus restoration and local sorting/pagination.
- Existing DataTable, EntityActions and frontend orchestration boundary tests pass.
- pnpm check and npx tsc --noEmit pass.
- openspec validate entity-row-context-menu --strict passes.
- Browser validation on existing local records: audit offers only page/summary; contract offers page/summary/edit/delete; selecting summary preserves the collection and opens detailId=62; Shift+F10 opens actions; Escape restores focus to the tr. Pointer menu positioning inspected in a real browser.
- Initial sandbox-wide run encountered filesystem hard-link restrictions in unrelated attachment storage tests. All 12 attachment storage tests pass with host filesystem permissions. The host run completed: 181 files passed, 3 failed; 859 tests passed, 3 failed (862 total).

- The three failures were stale tests in unchanged model/filter/detail contracts: remuneration fixture lacked required revenueType/assignmentType labels; fee filter clearing expected the old reset callback rather than applying a payload that removes clientId; attachment fallback assertions required a literal canUpload=true instead of permission-derived values from the preceding skeleton change. Updated only these test expectations/fixtures, preserving production behavior. All three affected files now pass (5 tests); no unrelated production code was changed.
- Final pnpm check and npx tsc --noEmit pass. The complete suite was not rerun after test-only corrections; the previously failing files were rerun successfully.
