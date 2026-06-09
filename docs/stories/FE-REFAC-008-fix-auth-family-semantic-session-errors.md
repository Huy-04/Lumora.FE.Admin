# FE-REFAC-008 Fix Auth Family Semantic Session Errors

## Status

planned

## Lane

normal

## Product Contract

Adjust FE Admin Auth-family behavior so it better matches the current
Lumora.BE session and authorization semantics, without changing backend code.
This batch is intentionally narrow and fixes only the two confirmed logic bugs
from `FE-AUDIT-004`.

Primary scope:

- `Shared/api/useApiClient.ts`
- `features/profile/composables/useProfileSessionsPage.ts`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- FE no longer treats every non-auth `403` response as a generic
  `session-expired` redirect.
- FE still expires the session for revoked/unauthorized token scenarios, but
  preserves ordinary forbidden/business-state errors for the UI.
- `Sign out every device` no longer reports a false failure after the backend
  has already revoked the current session.
- Verification shows no compile regression for the touched Auth-family
  surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact was run before editing the main FE symbols.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Session semantics: respect BE distinction between revoked/unauthorized token
  failure and ordinary forbidden responses.
- Self revoke-all flow: once BE revokes the current session, FE should clear
  local auth state without requiring a second successful logout call.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Auth/session flows preserve correct UI semantics for forbidden vs revoked states and self revoke-all |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- GitNexus impact results for `useApiClient` and `useProfileSessionsPage`.
- Refined auth-failure handling in the shared FE API client.
- Updated self session revoke-all flow to avoid false failure after successful
  backend revocation.
- Verification output for prepare/build after the refactor.
