# FE-REFAC-006 Align Category Index With BE List Search Contract

## Status

planned

## Lane

normal

## Product Contract

Refactor the FE Admin Category index flow so it uses the BE category
list/search contract more directly, instead of treating `tree/all` as the
primary list source. Preserve current user-facing behavior where practical, but
remove the main contract-underuse and pattern drift identified in
`FE-AUDIT-002`.

Primary scope:

- `features/categories/composables/useCategoryIndexPage.ts`
- `features/categories/composables/useCategoryAdminApi.ts` if needed
- `features/categories/components/CategoryIndexView.vue` wiring if needed

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The Category index no longer relies on `getAllCategoryTree()` as the primary
  list source for normal list/search behavior.
- FE Category index uses BE list/search endpoints in a way that better matches
  pagination and filter intent.
- Root-category actions that still need tree context keep working after the
  refactor.
- Verification shows no compile regression for the touched Category surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing the Category index symbols.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: improve contract alignment without widening into a Category
  detail/create redesign.
- UI surfaces: preserve current operator experience where practical.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Category index behavior stays coherent against BE list/search routes |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact results for `useCategoryIndexPage`, `useCategoryAdminApi`,
  and `CategoryIndexView.vue`.
- Refactored Category index data-source flow.
- Verification output for prepare/build after the refactor.
