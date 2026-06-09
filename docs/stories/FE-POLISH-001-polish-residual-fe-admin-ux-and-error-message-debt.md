# FE-POLISH-001 Polish Residual FE Admin UX and Error-Message Debt

## Status

planned

## Lane

normal

## Product Contract

Polish residual FE Admin UX, wording, error-message handling, and lightweight
cleanup debt across modules that no longer have live semantic mismatches.

Primary scope:

- `features/products`
- `features/inventory`
- `features/shipments`
- `features/coupons`
- `features/categories`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Improve republish error guidance in `Product` to match the quality of publish
  failure feedback without changing backend semantics.
- Polish `Inventory` UI affordance wording/placement where it currently risks
  misleading users, without changing inventory behavior.
- Refine `Shipment` UI wording and unreachable notices so the FE matches current
  route guards and backend auto-submit semantics more clearly.
- Improve `Coupon` field-level error handling and fallback wording consistency
  across create and edit flows.
- Remove the duplicated category depth constant by centralizing the FE category
  depth limit in one feature-local source.
- Verification is FE-only and should not change backend contracts or business
  rules.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary target; prior audit findings define the
  residual polish scope.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Work type: polish-only batch, not a semantic-fix batch.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | FE behavior and wording remain aligned with current BE semantics |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Source changes limited to UX/error-message polish and constant cleanup.
- Prepare/build proof after changes.
