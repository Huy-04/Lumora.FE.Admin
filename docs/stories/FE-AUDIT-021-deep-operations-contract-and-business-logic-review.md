# FE-AUDIT-021 - Deep Operations contract and business-logic review

## Summary

Audit the FE Admin Operations module against live Lumora.BE behavior. Verify contract alignment, permission gating, event/log filtering semantics, and whether FE wording, counts, and detail rendering match backend meaning.

## Scope

- `features/operations`
- `pages/system-events`

## Backend behavior source

- Operations controllers in `Lumora.BE`
- System-event query and detail handlers
- Authorization and filtering logic that defines what events are visible and what each status/field means

## What this pass checks

- Route and payload alignment between FE operations API usage and BE endpoints
- Whether FE filters, totals, detail fields, and summaries reflect BE semantics correctly
- Permission and visibility behavior for operations surfaces
- Any FE-only assumptions that distort backend event/log meaning

## Expected outcome

- Either confirm Operations is semantics-clean
- Or identify specific live mismatches that need a separate fix story

## Verification mode

- Scan-only unless a later follow-up fix story is opened
