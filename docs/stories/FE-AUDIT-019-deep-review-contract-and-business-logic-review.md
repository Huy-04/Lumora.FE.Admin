# FE-AUDIT-019 Deep Review Contract and Business-Logic Review

## Status

planned

## Lane

normal

## Product Contract

Perform a source-based deep review of the FE Admin `Review` module against the
current Lumora.BE review behavior, covering both API contract alignment and
business-logic semantics in a single pass.

Primary scope:

- `features/reviews`
- `pages/reviews`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Review FE Review flows against live BE semantics for list/search/detail,
  moderation or lifecycle actions, visibility or status handling, and any admin
  management affordances exposed by the current FE source.
- Report contract mismatches and business-logic mismatches together in one
  current-state verdict.
- Identify only live issues in current source; do not restate already-fixed
  findings from older passes as if they were still active.
- Verification is source-based only; no code change is required in this story
  unless a follow-up fix batch is requested.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary audit target; BE controllers and handlers
- are the behavior source for contract and business-rule comparison.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Audit target: FE Admin Review module.
- Behavior source: Lumora.BE Review controllers, handlers, and domain rules
  that drive admin review moderation behavior.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Review FE behavior assessed against live BE semantics |
| E2E | Not required for this scan-only story |
| Platform | Not required beyond source inspection for this story |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- Live FE source reads for Review flows and components.
- Live BE source reads for Review rule enforcement and response behavior.
- A current-state verdict that combines contract and logic findings in one pass.
