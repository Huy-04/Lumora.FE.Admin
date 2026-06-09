# FE-AUDIT-007 Rescan Product Business Logic After FE Fixes

## Status

planned

## Lane

high-risk

## Product Contract

Re-scan the FE Admin `Product` module business logic after the completed
Product-focused FE fixes, using Lumora.BE as the current behavior source.

Primary scope:

- `features/products/composables/useProductCreatePage.ts`
- `features/products/composables/useProductDetailPage.ts`
- `features/products/composables/useProductVariantsTab.ts`
- `features/products/components/ProductCreateView.vue`
- `features/products/components/ProductVariantsTab.vue`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Review current FE Product logic against live BE semantics for create/edit
  category selection, default-variant behavior, and any adjacent residual logic
  drift still visible after `FE-REFAC-011`.
- Confirm whether previously reported semantic mismatches from
  `FE-AUDIT-006` have been resolved by `FE-REFAC-011`.
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
- Audit target: FE Admin Product module.
- Behavior source: Lumora.BE Product controllers/handlers/aggregate rules.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Product FE behavior assessed against live BE semantics |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads for Product create/detail/variant flows.
- Live BE source reads for Product and Category rule enforcement that shapes
  Product FE semantics.
- A current-state verdict that distinguishes fixed issues from remaining logic
  mismatches.
