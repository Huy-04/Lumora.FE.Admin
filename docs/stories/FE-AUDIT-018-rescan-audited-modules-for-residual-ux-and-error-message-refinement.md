# FE-AUDIT-018 Rescan Audited Modules for Residual UX and Error-Message Refinement

## Status

planned

## Lane

normal

## Product Contract

Perform a current-state source-based rescan across already-audited FE Admin
modules to classify what remains after prior fix batches:

- live semantic mismatches that still need fixes
- residual cleanup, UX, or error-message refinement only
- modules that are already clean enough to leave alone

Primary scope:

- `features/auth`
- `features/profile`
- `features/users`
- `features/roles`
- `features/permissions`
- `features/categories`
- `features/products`
- `features/inventory`
- `features/warehouses`
- `features/orders`
- `features/shipments`
- `features/payments`
- `features/coupons`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Recheck already-audited modules against current FE source and the latest
  accepted findings from prior FE audit/fix stories.
- Identify which modules still have live semantic mismatches and which ones only
  have cleanup, UX, or error-message refinement opportunities.
- Report only current live state; do not restate already-fixed issues as if they
  were still active.
- Verification is source-based only; no code change is required in this story
  unless a follow-up fix batch is requested.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary audit target; existing accepted module audit
  stories provide the comparison baseline for current-state classification.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Audit target: already-audited FE Admin modules.
- Output shape: per-module classification into `clean`, `cleanup-only`, or
  `still-needs-fix`.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Current-state FE module behavior classification based on source |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads across already-audited modules.
- Current-state classification that separates semantic mismatches from cleanup
  and UX-only debt.
