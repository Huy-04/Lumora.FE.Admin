# FE-AUDIT-026 - Full FE Admin cleanliness pass

## Current Behavior

FE.Admin has many completed module audits and fix stories, but the repository
worktree is currently dirty across many admin modules. A previous focused BE
contract drift fix is complete, but that does not prove the whole admin
surface is clean.

## Target Behavior

FE.Admin is assessed against completed Lumora.BE behavior across the admin
surface. Any confirmed FE drift is fixed in scoped batches, and remaining
limits are documented clearly instead of being hidden behind a build-only
claim.

## Affected Users

- Admin operators using Lumora.FE.Admin.
- Engineers relying on FE.Admin route, permission, and API contract behavior.

## Affected Product Docs

- `docs/web-admin-flow-contracts.md`
- Paired backend source under `C:\Code\Project\Lumora.Ecom\Lumora.BE`

## Non-Goals

- Do not change Lumora.BE behavior.
- Do not clean unrelated dirty worktree files unless they are confirmed FE
  drift for this story.
- Do not claim E2E coverage if no authenticated/runtime environment is
  available.
