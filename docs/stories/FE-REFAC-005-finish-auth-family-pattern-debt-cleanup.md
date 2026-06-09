# FE-REFAC-005 Finish Auth Family Pattern Debt Cleanup

## Status

planned

## Lane

normal

## Product Contract

Align the remaining Auth family component-level pattern debt with the FE Admin
feature-first contract by moving direct API and mutation flow out of thin
edit/address tabs into feature-local composables, while preserving existing
props, emits, and user behavior.

The scope is limited to:

- `features/permissions/components/PermissionEditTab.vue`
- `features/roles/components/RoleEditTab.vue`
- `features/users/components/UserPasswordTab.vue`
- `features/profile/components/ProfileAddressesTab.vue`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The four target Vue components no longer keep their direct API and mutation
  flow inline.
- New composables stay inside the owning feature module.
- Parent detail/profile views keep the same props, emits, and route behavior.
- Verification shows no compile regression for the touched Auth family
  surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing each target file.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: keep the refactor small and feature-local; do not over-split
  trivial UI-only behavior.
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

- GitNexus impact results for the four target components.
- New feature-local composables for permission, role, user password, and
  profile address flows.
- Verification output for prepare/build after the refactor.
