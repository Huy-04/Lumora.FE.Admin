# FE-AUDIT-022 - Deep Settings surface contract and business-logic review

## Summary

Audit the FE Admin Settings surface against live source behavior. Verify whether it is purely FE-local or wired to backend/runtime state, and check that permission, persistence, and UI semantics match the real contract.

## Scope

- `features/settings`
- `pages/settings`

## Behavior source

- FE source of truth in `Lumora.FE.Admin`
- Any linked backend/runtime/config endpoints or local-session persistence behavior that Settings uses

## What this pass checks

- Whether Settings is FE-only or coupled to BE/runtime data
- Route, payload, and persistence semantics for settings changes
- Permission and visibility behavior
- Any FE wording or toggles that overstate what is really persisted or enforced

## Expected outcome

- Either confirm Settings is semantics-clean
- Or identify specific live mismatches that need a separate fix story

## Verification mode

- Scan-only unless a later follow-up fix story is opened
