# FE-SCAN-001 Source-only FE Admin Cleanliness Scan

## Status

planned

## Lane

normal

## Product Contract

Produce a source-only scan of `Lumora.FE.Admin` that evaluates whether the
frontend codebase is clean overall, whether its code-organization pattern is
coherent in live source, and whether any messiness is localized or systemic.

This story must not rely on external docs for conclusions. The scan may use the
local Harness workflow for intake, evidence, trace, and friction capture, but
the code-quality verdict must come from live source under:

- `pages/`
- `features/`
- `Shared/`
- `middleware/`
- `server/`
- `layouts/`
- `plugins/`

## Relevant Product Docs

- `none`

## Acceptance Criteria

- A source-only scan is completed against the live FE Admin codebase.
- The report distinguishes root/module structure from file-level responsibility
  hotspots.
- The report states whether the codebase is clean overall or has systemic
  pattern drift.
- Any tooling or Harness-runtime issue encountered during the flow is recorded
  as friction or backlog evidence.

## Design Notes

- Commands: Harness CLI for intake, story, backlog, trace, and SQL inspection.
- Queries: source tree counts, line-count scan, and targeted file reads.
- API: no product API changes; only repo-local Harness operational commands.
- Tables: `intake`, `story`, `backlog`, `trace`, and `story_gate`.
- Domain rules: source-only verdict; no docs-based conclusions.
- UI surfaces: none changed.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable for scan-only work |
| Integration | Harness CLI commands succeed where supported; source scan commands run |
| E2E | Not applicable for scan-only work |
| Platform | Windows `scripts/harness.cmd` path works for the task flow |
| Release | Not applicable |

## Harness Delta

- Capture any gate/story runtime inconsistency through backlog and trace.

## Evidence

- Intake records for the scan task.
- Story row for `FE-SCAN-001`.
- Story gate row for `plan`.
- Source-tree scan outputs and targeted hotspot file reads.
- Trace record for the completed scan.
