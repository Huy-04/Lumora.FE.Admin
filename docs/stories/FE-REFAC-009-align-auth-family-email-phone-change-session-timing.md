# FE-REFAC-009 Align Auth Family Email Phone Change Session Timing

## Status

planned

## Lane

normal

## Product Contract

Adjust FE Admin Auth-family email/phone change flows so local session state is
invalidated immediately after the backend completes the change, matching the
current Lumora.BE behavior more closely without changing any backend code.

Primary scope:

- `features/profile/composables/useProfileEmailChangeFlow.ts`
- `features/profile/composables/useProfilePhoneChangeFlow.ts`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- FE clears or expires local auth state immediately after successful
  `completeEmailChange`.
- FE clears or expires local auth state immediately after successful
  `completePhoneChange`.
- The success state remains understandable to the user and still ends at the
  login screen with the existing `security-updated` reason.
- Verification shows no compile regression for the touched Auth-family
  surfaces.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: GitNexus impact lookup for the two composables did not resolve the
  symbols directly, so the batch is treated as a narrow file-scoped edit with a
  direct caller chain through profile overview change panels.
- API: no backend contract changes.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Session semantics: once backend revokes refresh/access tokens, FE should not
  keep the local session marked authenticated for an extra delay window.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Profile email/phone change flows keep a coherent success path while aligning local session timing with BE revocation |
| E2E | Not required for this batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` pass |
| Release | Not applicable |

## Harness Delta

- Record closure friction if story state still expects unit proof after human
  acceptance.

## Evidence

- File-scoped caller-chain review for the two profile change flows and their
  panels.
- Immediate local-session invalidation after successful email/phone change.
- Verification output for prepare/build after the refactor.
