# FE-AUDIT-005 Rescan Category Business Logic After FE Fixes

## Status

planned

## Lane

normal

## Product Contract

Re-scan the FE Admin `Category` module business logic after the completed
Category-focused FE fixes, using Lumora.BE as the current behavior source.

Primary scope:

- `features/categories/composables/useCategoryIndexPage.ts`
- `features/categories/composables/useCategoryIndexActions.ts`
- `features/categories/composables/useCategoryDetailPage.ts`
- `features/categories/composables/useCategoryCreatePage.ts`
- `features/categories/composables/useCategoryEditTab.ts`
- `features/categories/components/CategoryChildrenTab.vue`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Review current FE Category logic against live BE semantics for list/search,
  hierarchy, create child, move, reorder, activate/deactivate, remove/restore.
- Confirm whether previously reported semantic mismatches have been resolved by
  `FE-REFAC-006` and `FE-REFAC-007`.
- Report only current live mismatches or residual risks; do not repeat stale
  findings as if they were still active.
- Verification is source-based only; no code change is required in this story
  unless the user asks for a follow-up fix batch.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: source-first FE/BE comparison; GitNexus may be used for navigation,
  but this is a scan-only story.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Audit target: FE Admin Category module.
- Behavior source: Lumora.BE Category controllers/handlers/checkers/guards.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Category FE behavior assessed against live BE semantics |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads for Category flows and components.
- Live BE source reads for Category rule enforcement.
- A current-state verdict that distinguishes fixed issues from remaining logic
  mismatches.
