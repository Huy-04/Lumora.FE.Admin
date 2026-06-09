# FE-AUDIT-008 Deep Inventory Family Contract and Business-Logic Review

## Status

planned

## Lane

high-risk

## Product Contract

Perform a source-based deep review of the FE Admin `Inventory family` against
the current Lumora.BE inventory behavior, covering both API contract alignment
and business-logic semantics in a single pass.

Primary scope:

- `features/inventory`
- `features/warehouses`
- `pages/inventory`
- `pages/warehouses`
- `pages/inventory-stocks`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Review FE Inventory family flows against live BE semantics for stock list and
  detail surfaces, warehouse-related selection or mutation flows, stock create
  or update flows, and any inventory status/quantity rules visible in current
  FE.
- Report contract mismatches and business-logic mismatches together in one
  current-state verdict.
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
- Audit target: FE Admin Inventory family.
- Behavior source: Lumora.BE Inventory controllers/handlers/services/rules.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Inventory family FE behavior assessed against live BE semantics |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads for Inventory family flows and components.
- Live BE source reads for Inventory rule enforcement and response behavior.
- A current-state verdict that combines contract and logic findings in one pass.
