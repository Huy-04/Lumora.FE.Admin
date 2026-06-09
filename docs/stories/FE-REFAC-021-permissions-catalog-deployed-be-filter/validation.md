# Validation

## Test Plan

| Layer | Proof |
| --- | --- |
| Unit | No dedicated unit target exists for this FE composable fix. |
| Integration | Source comparison against BE permissions controller/filter. |
| E2E | Authenticated browser smoke against deployed BE for permissions and role detail. |
| Platform | `npm.cmd run prepare`, `npm.cmd run build`, targeted `git diff --check`. |

## Evidence

- `npm.cmd run prepare` passed.
- `npm.cmd run build` passed.
- Targeted `git diff --check` passed with CRLF warnings only.
- Targeted authenticated browser smoke passed:
  - `/permissions`: `GET /api/Permissions?page=1&size=100` returned `200`.
  - `/roles/00000000-0000-0000-0000-000000000002`: `GET /api/Permissions?page=1&size=100` returned `200`.
  - No `/api/Permissions/module/Dashboard` calls were made.
- Production-preview authenticated browser smoke passed 18/18 index routes
  against deployed BE at `https://api.hlbeer.me`.
