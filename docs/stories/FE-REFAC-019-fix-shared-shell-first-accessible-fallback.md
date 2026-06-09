# FE-REFAC-019 - Fix shared shell first-accessible fallback

## Why

`FE-AUDIT-024` found that the shared admin shell fallback logic is inconsistent with the current route-access and navigation model.

`useAdminAuthorization.firstAccessiblePath()` can redirect a warehouse-only admin to `/profile` or `/settings` because `/warehouses` is missing from the preferred business-surface list, even though:

- route access rules explicitly allow `/warehouses`
- navigation exposes `Warehouses` as a top-level module

## Scope

- `features/auth/composables/useAdminAuthorization.ts`

## Non-goals

- No middleware redesign
- No navigation redesign
- No backend contract changes

## Impact

- `useAdminAuthorization`: `LOW`

## Expected outcome

- Unauthorized-route redirects land users on the first valid business surface that FE itself exposes
- `Warehouses` becomes reachable as a preferred fallback destination when it is the user's first real accessible module
