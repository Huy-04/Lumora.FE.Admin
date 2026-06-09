# FE-SCAN-002 Fresh Source-only FE Admin Cleanliness Scan

## Status

planned

## Lane

normal

## Product Contract

Produce a fresh source-only scan of `Lumora.FE.Admin` that answers whether the
live frontend codebase is clean overall, whether its code-organization pattern
is coherent in source, and whether any messiness is localized or systemic.

The verdict must be based on live source only. Docs may be used only for the
Harness workflow itself, not as evidence for the code-quality conclusion.

## Relevant Product Docs

- `none`

## Acceptance Criteria

- The scan covers live source under `pages/`, `features/`, `Shared/`,
  `middleware/`, `server/`, `layouts/`, and `plugins/`.
- The report distinguishes overall structure quality from file-level hotspots.
- The report states whether the project is clean overall or has systemic
  frontend pattern drift.
- The report identifies any localized hotspots with concrete source anchors.
- Harness friction or runtime inconsistency is recorded if encountered.

## Design Notes

- Commands: Harness CLI for intake, story, gate, backlog, trace, and SQL checks.
- Queries: source tree counts, page-shell checks, file-size scan, targeted
  hotspot reads, and module-level API-in-Vue concentration checks.
- API: no product API changes; only repo-local Harness commands are executed.
- Tables: `intake`, `story`, `story_gate`, `backlog`, and `trace`.
- Domain rules: source-only verdict, no docs-based code judgment.
- UI surfaces: none changed.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable for scan-only work |
| Integration | Harness CLI commands run where supported and source scan commands complete |
| E2E | Not applicable for scan-only work |
| Platform | Windows `scripts/harness.cmd` path works for the scan flow |
| Release | Not applicable |

## Harness Delta

- Capture any gate/runtime inconsistency through backlog and trace if it
  prevents clean story closure.

## Evidence

- Intake row for `#3`.
- Story row for `FE-SCAN-002`.
- `plan` gate approval row.
- Source-tree scan output and hotspot reads.
- Story proof update and trace row for the completed scan.
