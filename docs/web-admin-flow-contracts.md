# Web Admin Flow Contracts

This document records FE Admin flow rules that are derived from backend module
contracts and must stay aligned with `Lumora.Docs/Backend/Module`.

## Auth

- Session rows use `tokenStatus` as the source status.
- Per-session revoke actions are shown only when `tokenStatus` is `Active`.
- The admin session list reads from `GET /api/refresh-tokens`.
- User detail session tabs may read `GET /api/refresh-tokens/user/{id}` for the selected user.

## Category

- The category index is a root-tree management view and reads `GET /api/categories/all`.
- Category detail reads both `GET /api/categories/{id}` and `GET /api/categories/all` so the edit and child-management tabs can use the detail shape plus tree context.
- Re-parent controls must not allow selecting the same category or an invalid descendant as parent.
- Child/root reorder sends the full sibling order to `POST /api/categories/reorder`.

## Product

- Product search reads `GET /api/products/search`; the unfiltered admin index reads `GET /api/products/all` so soft-deleted records can be included by the Record state filter.
- Product `Draft` rows may expose publish when the actor has product publish permission. Product `Published` rows may expose unpublish and discontinue.
- Product `Discontinued` rows do not expose publish-like actions in Web Admin unless a dedicated business flow is added.
- Soft-deleted product rows expose restore only; edit, publish, feature, media, variant, and attribute actions stay hidden.
- Published products must keep at least one active variant and at least one gallery image; the UI should block obvious last-active-variant and last-gallery-image removals before calling the API.
- Gallery image edit uses `PUT /api/products/{productId}/gallery/{imageId}` only when changing the asset reference; alt-only edits should use `PUT /api/products/{productId}/gallery/{imageId}/alt` when a narrow UI is added.

## Cart

- Web Admin currently has no Cart management surface.
- Cart and checkout cart APIs are storefront/current-user flows. Do not expose admin cart actions unless a backend admin contract is added.
- Order detail may show checkout totals after storefront checkout creates an order; that is an Order surface, not a Cart editor.

## Order

- Admin order search reads `GET /api/orders/search` with keyword, warehouse, status, payment status, and created date filters.
- Order detail reads `GET /api/orders/{orderId}` and renders item snapshot fields from the order response; it must not refetch product names for historical items.
- Confirm is available only while `status` is `Pending`. A pending order with `stockReservationStatus = Failed` may retry confirm after inventory is fixed, but the UI must show an operations exception state.
- Start processing requires `status = Confirmed` and `stockReservationStatus = Reserved`.
- Cancel is hidden for terminal states: `Completed`, `Cancelled`, and `ReturnedToSender`.
- Return-to-sender starts from `InTransit`; deliver starts from `InTransit`; complete starts from `Delivered`.

## Inventory

- Inventory index and summary availability use `totalAvailableQuantity`, not `totalQuantity`.
- Manual stock status uses backend codes `Active = 0`, `OutOfStock = 1`, `Locked = 2` for `PUT /api/inventories/{inventoryId}/status`.
- Stock row alert badges use response `alertStatus` (`InStock`, `LowStock`, `OutOfStock`), not manual operational `status`.
- Warehouse response uses a single `address` field; Web Admin create/update forms send `address` as one string.
- Warehouse search filters are keyword, code, status, hasGhnStore, page, and size. Web Admin may use `GET /api/warehouses` for the unfiltered operational picker/list.

## Shipment

- Admin shipment search uses `GET /api/shipments` with keyword, orderId, status, carrier, page, and size query params.
- Shipment detail reads `GET /api/shipments/{shipmentId}`; order lookup reads `GET /api/shipments/orders/{orderId}`.
- `Draft` shipments expose submit-to-carrier when the actor can modify shipments.
- Submitted/tracking UI must show both `carrierOrderCode` and `carrierShopId` so admins can identify the provider order and the GHN shop snapshot used at submission.
- If `carrierOrderCode` is missing after submit, show the shipment as a provider submission issue rather than a normal trackable shipment.

## Payment

- Admin payment search reads `GET /api/payments/search` with keyword, userId, orderId, status, method, provider, createdFrom, createdTo, page, and size filters.
- Payment detail reads `GET /api/payments/{paymentId}` and renders provider attempts from `attempts`.
- Order lookup uses `GET /api/payments/orders/{orderId}` when a by-order flow is needed.
- Manual success/fail actions call `POST /api/payments/orders/{orderId}/manual-success` or `/manual-failed`; Web Admin treats them as admin fallback operations, not normal customer payment.
- Manual actions are exposed only while payment status is `Pending` or `Processing`; `Succeeded` and `Failed` are terminal in Web Admin.
- Backend currently authorizes admin payment reads/management through Order read/modify permissions, so Web Admin route guards use the same permission surface.

## Orchestrator And Public Contracts

- Web Admin does not call Checkout storefront endpoints directly.
- Checkout/orchestrator results surface in Admin through Order, Payment, Shipment, and Inventory states.
- `POST /api/orders/{orderId}/confirm` and `/start-processing` are orchestrated backend flows; Web Admin should call only those public admin endpoints, not internal module public-contract services.
- Shipment submit, payment manual fallback, and inventory stock views are operational follow-up surfaces after checkout/order orchestration has created durable records.
