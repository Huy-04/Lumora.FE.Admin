# FE-REFAC-017 - Fix Dashboard order-status total reconciliation

## Summary

Align the FE Dashboard order-status presentation with live BE summary semantics. The current FE chart shows `orders.total` from BE while omitting any returned-to-sender bucket, so the visible bars can fail to reconcile with the total.

## Scope

- `features/dashboard/composables/useDashboardPage.ts`
- `features/dashboard/components/DashboardView.vue`
- `features/dashboard/types/index.ts` if a FE-local response type extension is needed

## Backend source of truth

- `Lumora.BE/Lumora.Infrastructure/Modules/Dashboard/DataAccess/Queries/DashboardQueryService.cs`
- `Lumora.BE/Lumora.Application/Modules/Dashboard/Models/Responses/DashboardSummaryResponse.cs`

## Intended outcome

- Make FE order-status presentation reconcile with backend totals.
- Keep route and payload contracts unchanged.
- Do not invent new backend data; only align FE wording/buckets with what BE really returns.

## Risk

- GitNexus impact:
  - `DashboardView.vue`: `LOW`
  - `useDashboardPage`: `LOW`

## Verification

- `npx.cmd nuxt prepare`
- `npm.cmd run build`
