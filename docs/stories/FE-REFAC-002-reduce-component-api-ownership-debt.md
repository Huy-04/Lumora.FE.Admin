# FE-REFAC-002 Reduce Component API Ownership Debt

## Status

in_progress

## Lane

high-risk

## Product Contract

Reduce component-level pattern debt in FE Admin by moving API and mutation
flows out of heavy tabs and panels into feature-local composables, while
preserving user-visible behavior and existing parent-view contracts.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Heavy tabs and panels no longer keep their main API/mutation flow inline in
  the Vue SFC.
- New composables stay feature-local and do not push module-specific behavior
  into `Shared/`.
- Parent page/view contracts remain stable.
- Verification shows no compile regression for the touched features.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact for target files and surrounding page composables.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: keep feature-first FE structure; do not introduce backend-style
  layers.
- UI surfaces: no intentional user-facing changes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Touched views keep their parent contracts and behavior |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record any closure friction if story state still expects unit proof after
  human acceptance.

## Evidence

- GitNexus impact results for the targeted tabs/panels and surrounding
  composables.
- New feature-local composables for component-owned API flows.
- Verification output for prepare/build after the refactor.
