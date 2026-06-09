# Design

## Current Issue

The permissions index and role detail build a catalog by calling
`getPermissionsByModule` for every module option. Browser smoke against deployed
BE showed the Dashboard module call returns `400 InvalidFormat`.

## Change

Load the permission catalog with `GET /api/permissions?page=1&size=100`, then
apply module/search/operation/scope filters locally where needed. This keeps the
browser flow stable across deployed BE while preserving visible FE behavior.

## Non-Goals

- No BE changes.
- No permission create/edit option changes.
- No data mutation during smoke.
