# FE-REFAC-011 Fix Product Category Picker and Default Variant Semantic Mismatches

## Status

planned

## Lane

normal

## Product Contract

Adjust FE Admin `Product` behavior so it better matches the current
Lumora.BE product semantics, without changing backend code.

Primary scope:

- `features/products/composables/useProductCreatePage.ts`
- `features/products/components/ProductCreateView.vue`
- `features/products/composables/useProductDetailPage.ts`
- `features/products/composables/useProductVariantsTab.ts`
- `features/products/components/ProductVariantsTab.vue`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Product create/edit category pickers no longer restrict choices to active
  categories when BE only requires category existence.
- Product create flow really falls back to manual category-id entry when the
  category catalog cannot be loaded.
- `Set default` is no longer actionable for inactive variants; FE should block
  that affordance before the request reaches BE.
- Verification shows no compile regression for the touched Product surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing the main Product symbols.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: align FE with current BE create/update category semantics and
  default-variant rules.
- UI surfaces: prefer pragmatic affordance fixes over broad redesign.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Product create/edit/variant affordances stay coherent against current BE semantics |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact results for the touched Product symbols/files.
- Updated Product create/detail category option behavior.
- Updated Product variants default-variant affordance behavior.
- Verification output for prepare/build after the FE-only fix.
