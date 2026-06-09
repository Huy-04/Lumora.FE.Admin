# FE-REFAC-012 Degrade Product Detail Edit When Category Catalog Fails

## Status

planned

## Lane

high-risk

## Product Contract

Adjust FE Admin `Product` detail/edit behavior so category catalog lookup is
treated as optional support data instead of a hard page dependency, matching
the current Lumora.BE update semantics.

Primary scope:

- `features/products/composables/useProductDetailPage.ts`
- `features/products/components/ProductEditTab.vue`
- related Product detail wiring only if required

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Product detail page no longer fails wholesale when category tree lookup fails.
- Product edit surface degrades to manual `categoryId` entry when category
  catalog data is unavailable, similar to the create flow.
- Existing category label/select behavior stays intact when category tree lookup
  succeeds.
- Verification shows no compile regression for the touched Product surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing the main Product symbol.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: align FE with current BE behavior where update only requires
  category existence, not successful category catalog loading.
- UI surfaces: preserve current category-select UX when catalog data is
  available, but degrade gracefully instead of failing the page.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Product detail/edit stays usable when category catalog lookup is unavailable |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact result for the touched Product detail symbol.
- Updated Product detail/edit degradation behavior around category catalog
  lookup.
- Verification output for prepare/build after the FE-only fix.
