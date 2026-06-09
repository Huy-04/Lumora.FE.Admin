# FE-REFAC-003 Continue Remaining Pattern Alignment

## Status

in_progress

## Lane

high-risk

## Product Contract

Continue the FE Admin pattern-sync program by moving the remaining heavy
profile, product, and user tabs away from inline API and mutation flows into
feature-local composables, while preserving current parent contracts and user
behavior.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The targeted tabs and panels no longer keep their main API and mutation flow
  inline in the Vue SFC.
- New composables stay feature-local and do not push module-specific behavior
  into `Shared/`.
- Existing props, emits, and parent page/view contracts remain stable.
- Verification shows no compile regression for the touched features.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact for the target components before editing.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: keep the feature-first FE pattern; do not introduce backend
  layer splits.
- UI surfaces: no intentional user-facing behavior changes.

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

- GitNexus impact results for the targeted profile, product, and user
  components.
- New feature-local composables for the extracted flows.
- Verification output for prepare/build after the refactor.
