# FE-REFAC-021 Permissions Catalog Deployed-BE Filter

## Status

implemented

## Lane

high-risk

## Product Contract

Permissions index and role detail must load permission catalogs in the browser
against deployed BE without calling a module filter value rejected by that
deployment.

## Source Of Truth

- Deployed BE: `https://api.hlbeer.me`
- Local BE source: `PermissionsController`, `PermissionModuleFilter`
- FE surfaces: permissions index, role detail permissions tab

## Acceptance Criteria

- Permissions index loads without a `400 InvalidFormat` from
  `/api/permissions/module/Dashboard`.
- Role detail loads its permissions catalog without that `400`.
- Authenticated browser smoke against deployed BE passes targeted permission
  and role routes.
- `npm.cmd run prepare` and `npm.cmd run build` pass.

## Outcome

Implemented. Permissions index and role detail now load the permission catalog
through `GET /api/permissions?page=1&size=100` and filter locally. Targeted
browser smoke confirmed both pages no longer call
`/api/permissions/module/Dashboard`.
