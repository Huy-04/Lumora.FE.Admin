# FE-REFAC-004 Align Remaining User Role Profile Pattern Hotspots

## Status

planned

## Lane

high-risk

## Product Contract

Align the remaining non-trivial user, role, and profile tabs with the FE Admin
feature-first pattern by moving inline orchestration, sync, and confirm flows
out of Vue components into feature-local composables, while preserving current
props, emits, and user behavior.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- `UserRolesTab.vue`, `RolePermissionsTab.vue`, `UserProfileTab.vue`,
  `ProfileOverviewTab.vue`, and `UserAddressesTab.vue` no longer keep their
  main orchestration and mutation flow inline in the Vue SFC.
- New composables stay inside the owning feature and do not leak feature logic
  into `Shared/`.
- Parent page and view contracts remain stable.
- Verification shows no compile regression for the touched features.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact for the five target components before editing.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: keep the FE feature-first pattern; do not over-split thin edit
  forms that do not have meaningful orchestration.
- UI surfaces: no intentional user-facing behavior changes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Touched views keep existing props, emits, and behavior |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact results for the five target hotspots.
- New feature-local composables for user, role, and profile orchestration.
- Verification output for prepare/build after the refactor.
