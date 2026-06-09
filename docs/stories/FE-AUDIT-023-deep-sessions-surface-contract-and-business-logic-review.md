# FE-AUDIT-023 - Deep Sessions surface contract and business-logic review

## Summary

Audit the FE Admin Sessions surface against live FE and BE behavior. Verify session-list semantics, permission boundaries, revoke/read actions, and whether FE wording and totals match the real refresh-token/session model.

## Scope

- `features/sessions`
- `pages/sessions`

## Behavior source

- FE source in `Lumora.FE.Admin`
- BE refresh-token/session controllers, handlers, read models, and authorization behavior that power admin session visibility and revocation

## What this pass checks

- Route and payload alignment for session list/detail/revoke behavior
- Whether FE labels and totals match BE refresh-token/session semantics
- Permission and visibility behavior for admin session surfaces
- Any FE-only assumptions that distort backend meaning

## Expected outcome

- Either confirm Sessions is semantics-clean
- Or identify specific live mismatches that need a separate fix story

## Verification mode

- Scan-only unless a later follow-up fix story is opened
