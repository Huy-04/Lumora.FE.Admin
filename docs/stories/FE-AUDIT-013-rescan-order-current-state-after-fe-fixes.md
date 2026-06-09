# FE-AUDIT-013 Rescan Order Current-State After FE Fixes

## Status

planned

## Lane

normal

## Product Contract

Perform a source-based rescan of the FE Admin `Order` module against the
current Lumora.BE order behavior after FE-REFAC-015, confirming whether any
live semantic mismatches remain.

Primary scope:

- `features/orders`
- `pages/orders`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Recheck order index and detail flows against current BE semantics after the
  date-filter and `start-processing` FE fixes.
- Report only live issues in the current source; do not restate already-fixed
  findings as if they were still active.
- Separate any real mismatch from minor cleanup or UX debt.
- Verification is source-based only; no code change is required in this story
  unless a new follow-up fix batch is requested.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary audit target; BE controller, orchestrator,
  and domain-rule source define expected current behavior.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Audit target: FE Admin Order module current state.
- Behavior source: Lumora.BE OrdersController, SearchOrdersQHandler, order
  lifecycle orchestrator flows, and domain guards.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Order FE current-state assessed against live BE semantics |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads for current order flows after FE-REFAC-015.
- Live BE source reads for order search and lifecycle semantics.
- A current-state verdict that confirms whether Order still has any live
  mismatch after the latest FE fixes.
