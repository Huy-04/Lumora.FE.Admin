# FE-REFAC-015 Fix Order Date-Filter and Start-Processing Mismatches

## Status

planned

## Lane

normal

## Product Contract

Align the FE Admin `Order` module with current Lumora.BE semantics for UTC date
filters and the dedicated `start-processing` lifecycle transition.

Primary scope:

- `features/orders/composables/useOrderIndexPage.ts`
- `features/orders/composables/useOrderDetailPage.ts`
- `features/orders/composables/useOrderDetailActions.ts`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Order index date filters submit UTC boundary values compatible with the live
  BE `SearchOrdersQHandler` validation.
- Order detail exposes and executes a `start-processing` action when the order
  is in the live BE-accepted state for that transition.
- Existing FE view/page contracts remain stable.
- Verification uses local FE compile/build proof after the FE-only changes.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary change target; BE controller, orchestrator,
  and domain-rule source define the expected behavior.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Fix target: FE Admin Order module.
- Behavior source: Lumora.BE OrdersController, SearchOrdersQHandler, and
  StartProcessingOrder flow/domain guards.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Order FE behavior rechecked against live BE semantics |
| E2E | Not required for this FE-only batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` |
| Release | Not applicable |

## Harness Delta

- Record closure friction if the story still expects unit proof after human
  acceptance.

## Evidence

- Live FE source changes for order index/detail lifecycle flow.
- Live BE source alignment for UTC date filters and `start-processing`.
- Prepare/build verification after the FE-only fix.
