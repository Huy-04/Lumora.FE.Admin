# FE-AUDIT-001 Scan FE Admin Auth Family Against Live BE Contracts

## Status

planned

## Lane

normal

## Product Contract

Scan the FE Admin Auth family against the live Lumora.BE Auth module so the
frontend contract is checked from real source rather than assumptions. FE Admin
is the primary audit target. Lumora.BE is used only as the contract source for
routes, response shape, permission behavior, and error handling.

The scan covers the FE Admin surfaces under `auth`, `profile`, `users`,
`roles`, `permissions`, and `sessions`.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The scan reads the live BE Auth controllers that back the FE Admin Auth
  family.
- The scan reads the FE Admin API composables and the main page/detail flows
  for `auth`, `profile`, `users`, `roles`, `permissions`, and `sessions`.
- The report states whether FE routes and payload expectations match the live
  BE contract.
- The report calls out concrete mismatches in route path, response shape, error
  handling, or permission gating if found.
- The report ends with a direct verdict on whether the FE Admin Auth family is
  aligned or needs follow-up cleanup.

## Design Notes

- Commands: Harness CLI for intake, story, gate, backlog, trace, and SQL checks.
- Queries: direct source reads from BE controllers and FE composables/pages.
- API: no backend or frontend code changes in this story.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: FE Admin is the audit target; BE acts as the contract source
  only.
- UI surfaces: none changed.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable for scan-only work |
| Integration | FE composables and BE controllers can be mapped directly from source |
| E2E | Not applicable for scan-only work |
| Platform | Windows `scripts/harness.cmd` path works for the audit flow |
| Release | Not applicable |

## Harness Delta

- Record any Harness gate/runtime inconsistency if it blocks clean story
  closure.

## Evidence

- Intake row for `#9`.
- Story row for `FE-AUDIT-001`.
- `plan` gate approval row.
- BE controller reads and FE composable/page reads for the Auth family.
- Story proof update and trace row for the completed scan.
