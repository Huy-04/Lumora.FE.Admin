# FE-AUDIT-020 - Deep Dashboard contract and business-logic review

## Summary

Audit the FE Admin Dashboard module against live Lumora.BE dashboard behavior. Verify contract alignment, permission gating, summary/stat semantics, and whether FE wording/counts/actions match backend meaning.

## Scope

- `features/dashboard`
- `pages/dashboard`

## Backend behavior source

- Dashboard controllers in `Lumora.BE`
- Dashboard query/summary handlers
- Any supporting authorization or aggregation logic that defines what dashboard totals and charts mean

## What this pass checks

- Route and payload alignment between FE dashboard API usage and BE dashboard endpoints
- Whether FE summary cards, charts, and counts reflect backend semantics correctly
- Permission and visibility behavior for dashboard surfaces
- Any FE-only assumptions that overstate, understate, or distort backend meaning

## Expected outcome

- Either confirm Dashboard is semantics-clean
- Or identify specific live mismatches that need a separate fix story

## Verification mode

- Scan-only unless a later follow-up fix story is opened
