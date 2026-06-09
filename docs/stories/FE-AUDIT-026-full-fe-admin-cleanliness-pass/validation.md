# Validation

## Proof Strategy

The story is complete only when source comparison evidence exists and available
local validation passes. E2E/browser proof is recorded only if the needed
runtime and credentials are available.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | No dedicated unit target exists yet for this cross-module audit. |
| Integration | Source compare FE wrappers/composables/views against BE controllers/handlers. |
| E2E | Optional authenticated smoke for critical admin pages when environment allows. |
| Platform | `npm.cmd run prepare`, `npm.cmd run build`, targeted `git diff --check`. |
| Performance | Not in scope. |
| Logs/Audit | Harness trace records actions, friction, and validation proof. |

## Fixtures

- Paired local repositories:
  - `C:\Code\Project\Lumora.Ecom\Lumora.FE.Admin`
  - `C:\Code\Project\Lumora.Ecom\Lumora.BE`

## Commands

```powershell
.\scripts\harness.cmd query matrix
npm.cmd run prepare
npm.cmd run build
git diff --check -- <target files>
```

## Acceptance Evidence

- `npm.cmd run prepare` passed.
- `npm.cmd run build` passed.
- `git diff --check -- features/warehouses/composables/useWarehouseIndexPage.ts docs/web-admin-flow-contracts.md docs/stories/FE-AUDIT-026-full-fe-admin-cleanliness-pass/...` passed with CRLF warnings only.
- No E2E/browser proof was run because this pass did not have an authenticated admin runtime/credential fixture.
