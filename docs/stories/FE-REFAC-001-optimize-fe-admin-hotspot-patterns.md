# FE-REFAC-001 Optimize FE Admin Hotspot Patterns

## Status

in_progress

## Lane

high-risk

## Product Contract

Reduce pattern debt in FE Admin hotspot modules while preserving behavior.
Refactors should move oversized page-level orchestration toward smaller
feature-local composables and keep the existing route shell and view contracts
stable wherever possible.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Hotspot page composables are split into smaller feature-local helpers.
- Existing page/view public contracts stay stable unless there is a clear
  pattern reason to change them.
- Behavior stays aligned with current admin flows.
- The refactor reduces page-level mixed responsibilities before tackling
  component-level API ownership debt.

## Design Notes

- Commands: Harness CLI for story tracking and trace recording.
- Queries: GitNexus impact/context for page composables plus targeted source
  reads for connected views.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: keep FE feature-first structure; do not mirror backend layers.
- UI surfaces: no intentional user-facing behavior changes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing type/build surface remains valid |
| Integration | Targeted refactor keeps page/view contracts stable |
| E2E | Not required for the first refactor batch |
| Platform | Windows harness commands and local verification commands run |
| Release | Not applicable |

## Harness Delta

- Record any harness or verification friction encountered during the refactor.

## Evidence

- GitNexus impact checks for targeted `use*Page` composables.
- Refactored helper composables added under `features/*/composables`.
- Verification results for the touched FE modules.
