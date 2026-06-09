# FE-AUDIT-009 - Rescan Inventory family business logic after FE fixes

## Summary

Rescan FE Admin Inventory family against current Lumora.BE behavior after FE-REFAC-013 to confirm which mismatches are fixed and what residual debt remains.

## Scope

- `features/inventory/composables/useInventoryDetailPage.ts`
- `features/inventory/components/InventoryDetailView.vue`
- `features/inventory/composables/useInventoryStockCreatePage.ts`
- `features/inventory/components/InventoryStockCreateView.vue`
- `features/warehouses/composables/useWarehouseIndexPage.ts`
- `features/inventory/composables/useWarehouseDetailPage.ts`
- `features/warehouses/composables/useWarehouseCreatePage.ts`

## BE Contract Source

- `../Lumora.BE/Lumora.Api/Modules/Inventory/Controllers/WarehousesController.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Commands/AddStock/AddStockCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Commands/AdjustQuantity/AdjustQuantityCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Inventory/Features/Inventory/Commands/SetReorderPoint/SetReorderPointCHandler.cs`

## Review Goals

1. Confirm the FE-REFAC-013 permission and soft-dependency fixes are present in live source.
2. Identify any remaining semantic mismatches in warehouse index, inventory detail, or inventory stock create/adjust flows.
3. Separate true FE-vs-BE logic mismatches from lighter UX or scalability debt.
