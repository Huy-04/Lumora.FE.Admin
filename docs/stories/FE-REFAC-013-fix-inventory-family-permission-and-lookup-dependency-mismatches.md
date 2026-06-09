# FE-REFAC-013 - Fix Inventory family permission and lookup dependency mismatches

## Summary

Align FE Admin Inventory family with current BE semantics by correcting warehouse-remove permission gating, degrading warehouse create/detail when GHN address directory lookup fails, and degrading inventory detail when warehouse catalog lookup fails.

## Scope

- `features/inventory/composables/useWarehouseDetailPage.ts`
- `features/inventory/components/WarehouseDetailView.vue`
- `features/warehouses/composables/useWarehouseCreatePage.ts`
- `features/warehouses/components/WarehouseCreateView.vue`
- `features/inventory/composables/useInventoryDetailPage.ts`
- `features/inventory/components/InventoryDetailView.vue`

## BE Contract Source

- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Warehouse/Commands/RemoveWarehouse/RemoveWarehouseCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Warehouse/Commands/CreateWarehouse/CreateWarehouseCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Warehouse/Commands/UpdateWarehouse/UpdateWarehouseCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Queries/GetInventoryById/GetInventoryByIdQHandler.cs`

## Planned Changes

1. Gate warehouse removal by `warehouseRemoveAll`, not `warehouseUpdateAll`.
2. Keep GHN select UX when directory data loads, but degrade warehouse create/detail to manual address entry when GHN directory lookup fails.
3. Keep inventory detail usable when warehouse catalog lookup fails; treat warehouse names/statuses as best-effort context rather than a hard page dependency.

## Proof Plan

- `npx.cmd nuxt prepare`
- `npm.cmd run build`
