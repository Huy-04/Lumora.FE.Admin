# Web Admin Flow Contracts

This document records FE Admin flow rules that are derived from backend module
contracts and must stay aligned with `Lumora.Docs/Backend/Module`.

## Auth

> Full auth architecture documentation: [AUTH.md](./AUTH.md)

- Login uses `POST /api/authentication/admin-login` with `X-Device-Id` header; tokens live in HttpOnly cookies managed by BE.
- Session bootstrap uses `GET /api/authentication/me` to hydrate permissions on page load.
- Permission refresh is triggered after self-role-edit to keep client permissions in sync.
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
- `Draft` shipments expose retry submit in the Tracking tab when the actor can modify shipments. The normal submit path is the backend `ShipmentCreatedEvent` outbox processor.
- Submitted/tracking UI must show both `carrierOrderCode` and `carrierShopId` so admins can identify the provider order and the GHN shop snapshot used at submission.
- If `carrierOrderCode` is missing while the shipment is still `Draft`, show carrier handoff as pending and use System Events for the processing error.

## Operations

- Admin system event search reads `GET /api/system-events` with keyword, status, eventType, occurredFrom, occurredTo, page, and size filters.
- Event type is a text exact-match filter. Web Admin does not build event-type options from recent system events.
- Date filters are sent as UTC full-day boundaries: `occurredFrom` at `00:00:00.000Z` and `occurredTo` at `23:59:59.999Z`.
- The keyword search covers event id, aggregate id, payload, event type, and error text; Web Admin does not expose a separate Aggregate ID filter.
- Pending, failed, and processed summary counts are current-page counts; the total events count is the total matching the current search.
- System event detail reads `GET /api/system-events/{id}` and renders parsed payload values, raw payload, and error text for operational inspection.
- Web Admin treats System Events as read-only. Retry/replay/delete/payload-edit actions are not exposed.
- Shipment auto-submit failures surface as failed or retrying outbox messages in System Events, while shipment retry stays on the Shipment Tracking tab.
- System Events listens to `/hubs/operations` event `system-event.changed` and debounces a REST refetch. List pages refresh for any system-event change; detail pages refresh only when the event id matches the open record.

## Realtime

- Web Admin uses SignalR only as an invalidation hint. All visible data still comes from REST.
- Catalog realtime connects to same-origin `/hubs/catalog` and listens for `catalog.changed`.
- Category index/detail refresh on `entity = "category"`.
- Product index refreshes on `entity = "product"` or `entity = "category"`; product detail refreshes only when `entity = "product"` and `entityId` matches the open product.
- Inventory index refreshes on `entity = "inventory"` for stock status changes; inventory detail refreshes when the stock-status notification product id matches the open inventory product id.
- Operations realtime connects to same-origin `/hubs/operations` and listens for `system-event.changed`.
- The Nuxt app proxies `/hubs/**` to the BE API target so authenticated hubs can keep using HttpOnly auth cookies.
- Realtime refreshes are debounced and must not render SignalR payloads directly.

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
- Shipment retry, payment manual fallback, inventory stock views, and System Events are operational follow-up surfaces after checkout/order orchestration has created durable records.
