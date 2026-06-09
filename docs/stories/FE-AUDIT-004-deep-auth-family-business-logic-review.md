# FE-AUDIT-004 Deep Business-Logic Review of FE Admin Auth Family

## Status

planned

## Lane

normal

## Product Contract

Perform a read-only, source-backed business-logic review of the FE Admin Auth
family against the live Lumora.BE Auth behavior. FE Admin remains the main
audit target. Lumora.BE is used as the behavior source for self-versus-admin
boundaries, session and refresh-token rules, password and verification flows,
role and permission mutation semantics, and error interpretation.

The review covers the FE Admin surfaces under `features/auth`,
`features/profile`, `features/users`, `features/roles`,
`features/permissions`, and `features/sessions`, plus the BE Auth controllers
and the handlers they delegate to when needed to understand actual business
rules.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The review reads the live BE Auth source deeply enough to explain the
  family's actual business rules, not just route names.
- The review reads the FE Admin Auth-family API composables and the main
  auth/profile/users/roles/permissions/sessions flows.
- The report states whether FE behavior matches BE semantics for
  login/logout/me, refresh-token and session revocation flows, self-vs-admin
  boundaries, password reset and verification flows, and role/permission
  mutation behavior.
- The report calls out any brittle FE assumptions about BE error codes, field
  names, permission boundaries, or state transitions.
- The report ends with a direct verdict on whether the FE Admin Auth family is
  semantically aligned or needs follow-up fixes.

## Design Notes

- Commands: Harness CLI for intake, story, gate, backlog, trace, and SQL
  checks.
- Queries: direct source reads from BE Auth controllers and handlers, plus FE
  composables, components, and pages.
- API: no backend or frontend code changes in this story.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: FE Admin is the audit target; BE acts as the behavior source.
- UI surfaces: none changed.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable for scan-only work |
| Integration | FE Auth-family flows and BE Auth handlers can be mapped directly from source |
| E2E | Not applicable for scan-only work |
| Platform | Windows `scripts/harness.cmd` path works for the audit flow |
| Release | Not applicable |

## Harness Delta

- Record any Harness gate/runtime inconsistency if it blocks clean story
  closure.

## Evidence

- Intake row for `#15`.
- Story row for `FE-AUDIT-004`.
- `plan` gate approval row.
- BE Auth controller and handler reads for business-rule validation.
- FE Auth-family composable/component/page reads for behavior validation.
- Story proof update and trace row for the completed review.
