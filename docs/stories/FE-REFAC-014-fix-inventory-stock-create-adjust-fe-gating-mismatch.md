# FE-REFAC-014 - Fix Inventory stock create-adjust FE gating mismatch

## Summary

Align FE Admin inventory stock create-adjust flows with current BE semantics by removing unnecessary warehouse-read coupling and degrading warehouse catalog lookup instead of hard-failing the page.

## Scope

- `features/inventory/composables/useInventoryStockCreatePage.ts`
- `features/inventory/components/InventoryStockCreateView.vue`
- `features/inventory/components/InventoryStockReorderPointView.vue` if shared page-state wiring needs it

## BE Contract Source

- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Commands/AddStock/AddStockCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Commands/AdjustQuantity/AdjustQuantityCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Commands/SetReorderPoint/SetReorderPointCHandler.cs`
- `../Lumora.BE/Lumora.Api/Modules/Inventory/Controllers/InventoriesController.cs`

## Planned Changes

1. Treat warehouse catalog lookup as soft support data instead of a hard dependency for inventory stock create/adjust pages.
2. Remove FE-only coupling that blocks submit solely because `warehouseReadAll` is absent.
3. Preserve select-based UX when warehouse catalog loads; degrade to requested-warehouse context and warning when catalog lookup is unavailable.

## Proof Plan

- `npx.cmd nuxt prepare`
- `npm.cmd run build`
