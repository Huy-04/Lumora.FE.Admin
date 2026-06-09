# FE-AUDIT-026 Module Contract Matrix

## Scope

This matrix tracks source-backed FE.Admin cleanliness against completed
Lumora.BE contracts. "Clean" means no confirmed FE drift remains in the checked
module for route, query/body, response, permission, lifecycle/status, and
problem-details handling.

| Module | BE anchors | FE anchors | Status | Findings |
| --- | --- | --- | --- | --- |
| Auth/Profile/Sessions | AuthenticationController, CurrentUsersController, UsersController, RefreshTokenController | useAuthApi, useApiClient, useSessionsAdminApi, profile/session pages | Clean | Current routes and session-expiry handling align; sessions surface now describes active refresh sessions. |
| Users/Roles/Permissions | UsersController, RolesController, PermissionsController, Permission enums/mapper | useUsersAdminApi, useRolesAdminApi, usePermissionsAdminApi, useAuthOptions | Clean | Routes and module/submodule options align with current BE enums, including Dashboard and warehouse/inventory split. |
| Categories | CategoriesController, CatalogCategoriesController | useCategoryAdminApi, category page composables/views | Clean | Prior current-state rescan found no remaining live semantic mismatch. |
| Products | ProductsController, ProductVariantsController, ProductGalleryController, ProductAssetsController, ProductAttributesController | useProductAdminApi, product page composables/views | Clean with polish debt | Routes align; remaining republish/category/error-message notes are explanation polish, not blocking contract drift. |
| Inventory/Warehouses | InventoriesController, WarehousesController, InventoryWarehousePolicyMap | useInventoryAdminApi, inventory/warehouse page composables/views | Fixed in this story | Warehouse index now uses BE `/api/warehouses/search` paging instead of client-side all-row filtering; inventory stock warehouse-scoped permissions are aligned. |
| Orders | OrdersController | useOrderAdminApi, order pages | Clean | Prior fix added UTC date filters and start-processing action; current wrapper routes align. |
| Payments | PaymentsController | usePaymentAdminApi, payment pages | Clean | Admin payment route is `/api/admin/payments`; UTC filters are already normalized. |
| Shipments | ShipmentsController, GhnMasterDataController | useShipmentAdminApi, useGhnApi, shipment pages | Clean | Routes, submit semantics, and GHN helper routes align. |
| Coupons | CouponsController | useCouponsAdminApi, coupon pages | Clean with polish debt | Routes and UTC create/search behavior align; remaining generic error mapping is acceptable for explanation-level errors. |
| Reviews | AdminReviewsController | useReviewAdminApi, review pages | Clean with UX debt | Routes/actions align; current page-only summary wording is explicit. |
| Dashboard | DashboardController, dashboard query handlers | useDashboardAdminApi, DashboardView | Clean | Returned-to-sender residual bucket is rendered; route access follows admin access. |
| Operations | SystemEventsController, OperationsHub | useSystemEventAdminApi, operations pages, realtime helper | Clean | `aggregateId`, UTC occurred filters, status, and realtime invalidation align. |
| Settings/Shell/Shared API | Auth middleware, route authorization, proxy/error helpers | auth.global, useAdminAuthorization, useAdminNavigation, useApiClient, apiErrors | Clean | First-accessible fallback includes warehouses; generic 403 is permission-denied and 401/session codes remain auth-specific. |

## Validation Notes

- `npm.cmd run prepare` passed.
- `npm.cmd run build` passed.
- Targeted `git diff --check` passed with CRLF warnings only on touched files.
- No authenticated E2E/browser smoke was run in this pass.
