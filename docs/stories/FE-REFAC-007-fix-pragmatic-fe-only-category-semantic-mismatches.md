# FE-REFAC-007 Fix Pragmatic FE-only Category Semantic Mismatches

## Status

planned

## Lane

normal

## Product Contract

Adjust FE Admin Category behavior so it better matches the current Lumora.BE
Category business rules, without changing any backend code. This batch is
intentionally pragmatic: fix the most user-visible semantic mismatches while
keeping the FE simple.

Primary scope:

- `features/categories/composables/useCategoryIndexActions.ts`
- `features/categories/composables/useCategoryDetailPage.ts`
- `features/categories/components/CategoryChildrenTab.vue`
- `features/categories/composables/useCategoryCreatePage.ts`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Category delete prechecks only block when there are non-deleted child
  categories, matching the current BE delete semantics.
- The `Add child` affordance remains visible from the child tab, but becomes
  disabled with a clear explanation when the current parent category cannot
  accept child creation.
- The create page no longer trusts an invalid deep-linked `parentId`; invalid
  or unavailable parent selections are cleared or blocked before child submit.
- Verification shows no compile regression for the touched Category surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing the main Category symbols.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: align FE with existing BE behavior; do not add a heavy
  ancestor-chain UX guard in this batch.
- UI surfaces: keep the existing `Add child` action visible instead of hiding
  it entirely.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Category delete/create affordances stay coherent against current BE semantics |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact results for the touched Category symbols.
- Refined delete precheck logic for root and child category removal.
- Updated child-create affordance state in the detail child tab.
- Deep-link parent validation in the Category create flow.
- Verification output for prepare/build after the refactor.
