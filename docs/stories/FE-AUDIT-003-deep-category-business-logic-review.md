# FE-AUDIT-003 Deep Business-Logic Review of FE Admin Category Module

## Status

planned

## Lane

normal

## Product Contract

Perform a read-only, source-backed business-logic review of the FE Admin
Category module against the live Lumora.BE Category behavior. FE Admin remains
the main audit target. Lumora.BE is used as the behavior source for category
state transitions, hierarchy rules, move and reorder constraints, deletion and
restore semantics, and error interpretation.

The review covers the FE Admin surfaces under `features/categories` and
`pages/categories`, plus the BE Category controllers and the handlers they
delegate to when needed to understand actual business rules.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The review reads the live BE Category source deeply enough to explain the
  module's actual business rules, not just route names.
- The review reads the FE Admin Category API composable and the main
  index/detail/create/edit/children flows.
- The report states whether FE behavior matches BE semantics for create, move,
  reorder, activate, deactivate, remove, and restore flows.
- The report calls out any brittle FE assumptions about BE error codes, field
  names, hierarchy depth, or state transitions.
- The report ends with a direct verdict on whether the FE Admin Category module
  is semantically aligned or needs follow-up fixes.

## Design Notes

- Commands: Harness CLI for intake, story, gate, backlog, trace, and SQL
  checks.
- Queries: direct source reads from BE Category controllers and handlers, plus
  FE composables, components, and pages.
- API: no backend or frontend code changes in this story.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: FE Admin is the audit target; BE acts as the behavior source.
- UI surfaces: none changed.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable for scan-only work |
| Integration | FE Category flows and BE Category handlers can be mapped directly from source |
| E2E | Not applicable for scan-only work |
| Platform | Windows `scripts/harness.cmd` path works for the audit flow |
| Release | Not applicable |

## Harness Delta

- Record any Harness gate/runtime inconsistency if it blocks clean story
  closure.

## Evidence

- Intake row for `#13`.
- Story row for `FE-AUDIT-003`.
- `plan` gate approval row.
- BE Category controller and handler reads for business-rule validation.
- FE Category composable/component/page reads for behavior validation.
- Story proof update and trace row for the completed review.
