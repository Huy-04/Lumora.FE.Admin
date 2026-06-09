# FE-REFAC-018 - Fix Sessions gating and active-session semantics

## Why

`FE-AUDIT-023` found two live mismatches in the `Sessions` admin surface:

1. The `/sessions` route is gated in FE by both `Auth.User.Read.All` and `Auth.RefreshToken.Read.All`, while BE read-session handlers only enforce refresh-token read permission.
2. The sessions index presents the dataset as if it mixes active and expired/revoked sessions, while BE only returns active, unexpired sessions.

## Scope

- `features/auth/composables/useAdminAuthorization.ts`
- `features/sessions/composables/useSessionsIndexPage.ts`
- `features/sessions/components/SessionsIndexView.vue`

## Non-goals

- No BE contract changes
- No new session history surface
- No redesign of revoke-all vs force-logout semantics beyond wording if needed for clarity

## Impact

- `useAdminAuthorization`: `LOW`
- `useSessionsIndexPage`: `LOW`
- `SessionsIndexView.vue`: `LOW`

## Expected outcome

- `/sessions` route access matches current BE permission semantics
- Sessions index clearly represents active sessions only
- Summary/empty-state/copy no longer imply expired or revoked sessions are part of the loaded dataset
