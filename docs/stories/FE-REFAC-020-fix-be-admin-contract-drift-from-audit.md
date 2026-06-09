# FE-REFAC-020 - Fix BE admin contract drift from audit

## Context

Source: `Lumora.BE` story `US-LUMORA-040` BE-to-FE.Admin contract audit.

This FE batch fixes confirmed frontend drift where BE is the source of truth:

- Inventory stock update permission gating must allow `Inventory.Inventory.Update.All` or warehouse-scoped update permissions `HN`, `HCM`, `DN`.
- Permission management options must expose BE-supported Dashboard module/submodule.
- System Events index should expose BE-supported exact `aggregateId` filtering.
- Payment flow docs should use current admin payment routes under `/api/admin/payments`.
- Error display only needs to be good enough to explain BE problem details to admins, not a bespoke message for every field.

## Changes

- Restored FE constants and route access for warehouse-scoped inventory update policies.
- Added inventory stock permission helpers that narrow by BE warehouse code when the warehouse catalog is available, while still allowing BE to enforce final authorization when only a warehouse id is known.
- Updated inventory stock detail/create/reorder-point views to explain warehouse-specific access instead of requiring only global inventory update.
- Added Dashboard to permission module/submodule options and module-submodule mapping.
- Added `aggregateId` to System Events filters and query key.
- Updated FE flow docs for System Events and admin payment routes.
- Adjusted shared error copy so `AccessDenied` and generic 403 mean permission denied, while session-specific codes still explain re-login/session expiry.

## Validation

Commands run:

```powershell
npm.cmd run prepare
npm.cmd run build
git diff --check -- <changed files>
```

Results:

- `npm.cmd run prepare` passed.
- `npm.cmd run build` passed.
- `git diff --check` reported no whitespace errors; it printed CRLF warnings for touched files.

Known limits:

- No browser/E2E run was performed.
- The FE worktree was already heavily dirty before this batch, so GitNexus `detect_changes` reported critical scope for the whole unstaged tree. Targeted impact checks on edited symbols were low/ambiguous due to stale index, and final proof is the targeted source diff plus Nuxt prepare/build.
