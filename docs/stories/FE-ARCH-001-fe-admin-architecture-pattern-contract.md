# FE-ARCH-001 Tighten FE Admin Architecture Pattern Contract

## Status

implemented

## Lane

normal

## Product Contract

Tighten `docs/ARCHITECTURE.md` into a frontend-native pattern contract for
`Lumora.FE.Admin`. The document must lock the intended source structure and
boundary rules without copying the heavier backend architecture-document style.

The contract should be grounded in the current source tree and should help keep
the repo clean as it grows, especially around page composables, feature
components, shared ownership, and API-call placement.

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- The architecture doc describes the FE Admin structure using frontend-native
  ownership rules.
- The doc distinguishes route shells, feature composables, feature components,
  shared primitives, and the Nuxt proxy boundary.
- The doc defines default API-call placement and when direct component-level API
  calls are considered exceptions.
- The doc includes concrete refactor triggers so future scans can judge pattern
  drift consistently.
- The doc reflects current source reality instead of mirroring backend
  architecture detail.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording, plus source
  inspection commands.
- Queries: page-shell pattern checks and direct `use*Api()` usage inside `.vue`
  components.
- API: no product API changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Domain rules: `Lumora.BE` stays the business source of truth; FE Admin owns
  UI composition and proxy/runtime boundaries.
- UI surfaces: documentation only.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable for docs-only contract work |
| Integration | Source inspection supports each architecture rule |
| E2E | Not applicable |
| Platform | `.\scripts\harness.cmd` workflow remains usable on Windows |
| Release | Not applicable |

## Harness Delta

- Record any harness gate/runtime inconsistency if it blocks a clean story
  transition.

## Evidence

- `docs/ARCHITECTURE.md` updated to define FE-native ownership rules.
- Source scan anchors include thin-page usage under `pages/` and direct
  `use*Api()` calls inside selected feature components.
