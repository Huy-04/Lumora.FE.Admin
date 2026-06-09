# FE-REFAC-010 Guard Category Child State Actions Under Inactive Parent

## Status

planned

## Lane

normal

## Product Contract

Adjust FE Admin `Category` child-state affordances so they better match the
current Lumora.BE branch-state semantics, without changing any backend code.

Primary scope:

- `features/categories/composables/useCategoryDetailPage.ts`
- `features/categories/components/CategoryChildrenTab.vue`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Child `Activate` and `Restore` actions are no longer actionable when the
  current parent branch is inactive or deleted.
- The child tab keeps the state affordance visible, but blocked actions are
  disabled with a clear explanation instead of disappearing.
- Existing `Deactivate`, `Remove`, reorder, and open-child flows keep their
  current behavior unless directly required by the branch-state guard.
- Verification shows no compile regression for the touched Category surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing the main Category symbols.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: align FE with the current BE ancestor/branch-state semantics in
  a pragmatic FE-only way.
- UI surfaces: keep child state actions visible; blocked actions should be
  disabled with explanation rather than hidden entirely.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Child state actions stay coherent against current BE branch-state semantics |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact results for `useCategoryDetailPage` and `CategoryChildrenTab.vue`.
- Refined child action guards and disabled-state reasons for the Category child tab.
- Verification output for prepare/build after the FE-only fix.
