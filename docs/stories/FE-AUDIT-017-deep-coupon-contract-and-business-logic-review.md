# FE-AUDIT-017 Deep Coupon Contract and Business-Logic Review

## Status

planned

## Lane

normal

## Product Contract

Perform a source-based deep review of the FE Admin `Coupon` module against the
current Lumora.BE coupon behavior, covering both API contract alignment and
business-logic semantics in a single pass.

Primary scope:

- `features/coupons`
- `pages/coupons`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Review FE Coupon flows against live BE semantics for list/search/detail,
  create/update, activate/deactivate, effective window handling, and admin
  management actions.
- Report contract mismatches and business-logic mismatches together in one
- current-state verdict.
- Identify only live issues in current source; do not restate already-fixed
  findings from older passes as if they were still active.
- Verification is source-based only; no code change is required in this story
  unless a follow-up fix batch is requested.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary audit target; BE controllers/handlers are
  the behavior source for contract and business-rule comparison.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Audit target: FE Admin Coupon module.
- Behavior source: Lumora.BE Coupon module controllers/handlers/services plus
  coupon effective-window and admin activation semantics.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Coupon FE behavior assessed against live BE semantics |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads for Coupon flows and components.
- Live BE source reads for Coupon rule enforcement and response behavior.
- A current-state verdict that combines contract and logic findings in one pass.
