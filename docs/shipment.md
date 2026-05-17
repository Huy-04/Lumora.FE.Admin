# Shipment Module — Tài liệu FE Admin

## Tổng quan

Module Shipment trên FE Admin cung cấp giao diện quản lý vận đơn cho admin, bao gồm: tìm kiếm/lọc danh sách vận đơn, xem chi tiết, tạo mới, và retry submit đơn sang carrier (GHN). Module cũng sử dụng GHN master data cho cascading dropdown địa chỉ trong các form tạo/sửa địa chỉ.

---

## Cấu trúc thư mục

```
features/shipments/
├── components/
│   ├── ShipmentDetailView.vue        # Trang chi tiết vận đơn (3 tabs)
│   └── ShipmentIndexView.vue         # Trang danh sách + tìm kiếm
├── composables/
│   ├── useShipmentAdminApi.ts        # API composable (5 endpoints)
│   ├── useGhnApi.ts                  # GHN master data API (3 endpoints)
│   ├── useShipmentDetailPage.ts      # State management trang chi tiết
│   └── useShipmentIndexPage.ts       # State management trang danh sách
└── types/
    ├── index.ts                      # ShipmentResponse, Request types
    └── ghn.ts                        # GHN response types
```

---

## Endpoint Mappings (API Composable → BE)

### Shipment Endpoints (`useShipmentAdminApi.ts`)

| # | Composable Method | HTTP | BE Route | Request | Response |
|---|-------------------|------|----------|---------|----------|
| 1 | `searchShipments(params)` | GET | `/api/shipments` | Query: keyword, orderId, status, carrier, page, size | `PaginatedResponse<ShipmentResponse>` |
| 2 | `getShipmentById(id)` | GET | `/api/shipments/{shipmentId}` | — | `ShipmentResponse` |
| 3 | `getShipmentByOrderId(orderId)` | GET | `/api/shipments/orders/{orderId}` | — | `ShipmentResponse` |
| 4 | `createShipment(payload)` | POST | `/api/shipments` | Body: `CreateShipmentRequest` | `ShipmentResponse` (201) |
| 5 | `submitShipment(id, payload)` | POST | `/api/shipments/{shipmentId}/submit` | Body: `SubmitShipmentRequest` (optional) | `ShipmentResponse` |

### GHN Master Data Endpoints (`useGhnApi.ts`)

| # | Composable Method | HTTP | BE Route | Request | Response |
|---|-------------------|------|----------|---------|----------|
| 6 | `getProvinces()` | GET | `/api/ghn/provinces` | — | `GhnProvinceResponse[]` |
| 7 | `getDistricts(provinceId)` | GET | `/api/ghn/districts?provinceId={id}` | Query: provinceId (number) | `GhnDistrictResponse[]` |
| 8 | `getWards(districtId)` | GET | `/api/ghn/wards?districtId={id}` | Query: districtId (number) | `GhnWardResponse[]` |

---

## Permission Model

Module sử dụng 2 permission keys cho shipment:

| Permission Key | Gated Actions | Nơi check |
|----------------|---------------|-----------|
| `shipmentReadAll` | Xem danh sách vận đơn, xem chi tiết vận đơn | `useShipmentIndexPage.ts`, `useShipmentDetailPage.ts` |
| `shipmentModifyAll` | Tạo vận đơn, submit/retry vận đơn sang carrier | `useShipmentDetailPage.ts` |

### Quy tắc permission gating:

- Nút **Retry Submit** chỉ hiển thị khi: `status === "Draft" AND user có permission shipmentModifyAll`
- Navigation link đến shipment module chỉ hiện khi user có `shipmentReadAll`
- BE endpoints yêu cầu `[Authorize]` cho tất cả — FE gate UI để UX tốt hơn

---

## Status Lifecycle và Badge Rules

### Bảng trạng thái (ShipmentStatus)

| Status | Badge Tone | Ý nghĩa | UI Behavior |
|--------|-----------|----------|-------------|
| `Draft` | `warning` (amber) | Vận đơn mới tạo, chưa submit | Hiện nút Retry Submit (nếu có permission) |
| `Submitted` | `default` | Đã gửi sang carrier | Hiển thị carrierOrderCode, carrierShopId |
| `PickedUp` | `default` | Carrier đã lấy hàng | Tracking in-progress |
| `InTransit` | `default` | Đang vận chuyển | Tracking in-progress |
| `Delivered` | `success` (green) | Giao hàng thành công | Terminal state |
| `Returned` | `danger` (red) | Hoàn hàng | Terminal exception state |
| `Cancelled` | `danger` (red) | Đã hủy | Terminal state, hiển thị cancellation details |
| `Failed` | `danger` (red) | Gửi carrier thất bại | Terminal exception state |

### Logic badge (trong component):

```typescript
// ShipmentIndexView.vue & ShipmentDetailView.vue
tone = shipment.status === 'Delivered' ? 'success'
     : shipment.status === 'Cancelled' || shipment.status === 'Failed' || shipment.status === 'Returned' ? 'danger'
     : shipment.status === 'Draft' ? 'warning'
     : 'default'
```

---

## GHN Master Data — Cascading Dropdown Pattern

### Mô tả

GHN (Giao Hàng Nhanh) cung cấp dữ liệu địa chỉ 3 cấp: Tỉnh/Thành → Quận/Huyện → Phường/Xã. FE Admin sử dụng pattern cascading dropdown:

```
┌─────────────┐     chọn province     ┌─────────────┐     chọn district     ┌──────────┐
│  Provinces  │ ──────────────────────▶│  Districts  │ ──────────────────────▶│  Wards   │
│  (load 1x)  │                        │  (load theo │                        │ (load theo│
└─────────────┘                        │  provinceId)│                        │ districtId)│
                                       └─────────────┘                        └──────────┘
```

### Flow:

1. Component mount → gọi `getProvinces()` → populate dropdown tỉnh/thành
2. User chọn tỉnh → gọi `getDistricts(provinceId)` → populate dropdown quận/huyện, reset ward
3. User chọn quận → gọi `getWards(districtId)` → populate dropdown phường/xã

### Nơi sử dụng trong FE Admin:

- `features/users/components/UserAddressCreateView.vue`
- `features/users/components/UserAddressEditView.vue`
- `features/profile/components/ProfileAddressCreateView.vue`
- `features/profile/components/ProfileAddressEditView.vue`

### Types:

```typescript
// types/ghn.ts
interface GhnProvinceResponse {
  provinceId: number;
  provinceName: string;
}

interface GhnDistrictResponse {
  districtId: number;
  districtName: string;
}

interface GhnWardResponse {
  wardCode: string;   // Lưu ý: wardCode là string, không phải number
  wardName: string;
}
```

---

## Các thay đổi trong quá trình review (Shipment Module Review)

### 1. Fix badge tone cho status `Returned`

**Vấn đề:** Trước review, status `Returned` không nằm trong nhóm `danger` badge → hiển thị `default` tone.

**Fix:** Thêm `shipment.status === 'Returned'` vào điều kiện danger trong cả `ShipmentIndexView.vue` và `ShipmentDetailView.vue`.

**Trước:**
```
status === 'Cancelled' || status === 'Failed' ? 'danger' : ...
```

**Sau:**
```
status === 'Cancelled' || status === 'Failed' || status === 'Returned' ? 'danger' : ...
```

### 2. Fix type `pickStationId` và `deliverStationId` trong `SubmitShipmentRequest`

**Vấn đề:** FE type ban đầu khai báo `pickStationId` và `deliverStationId` là `string | null`, không khớp BE contract (`int?` → `number | null`).

**Fix:** Đổi type sang `number | null` trong `features/shipments/types/index.ts`.

**Trước:**
```typescript
pickStationId?: string | null;
deliverStationId?: string | null;
```

**Sau:**
```typescript
pickStationId?: number | null;
deliverStationId?: number | null;
```

---

## TypeScript Types tham khảo

### ShipmentResponse (đầy đủ)

```typescript
interface ShipmentResponse {
  id: string;                              // Guid
  orderId: string;                         // Guid
  orderNumber: string;
  shipmentNumber: string;
  carrier: string;                         // "GHN" (string representation of enum)
  carrierOrderCode?: string | null;
  carrierShopId?: number | null;
  status: ShipmentStatus | string;
  submittedAt?: string | null;             // ISO DateTime
  pickedAt?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  cancelledAt?: string | null;
  cancellation?: ShipmentCancellationResponse | null;
  createdBy: string;                       // Guid
  updatedBy: string;                       // Guid
  createdAt: string;                       // ISO DateTime
  updatedAt: string;                       // ISO DateTime
}
```

### ShipmentCancellationResponse

```typescript
interface ShipmentCancellationResponse {
  reason: string;
  cancelledBy: string;   // Guid
  cancelledAt: string;   // ISO DateTime
}
```

### Request Types

```typescript
interface CreateShipmentRequest {
  orderId: string;                // required
  shipmentNumber?: string | null; // optional
}

interface SubmitShipmentRequest {
  requiredNote?: string | null;
  note?: string | null;
  content?: string | null;
  insuranceValue?: number | null;
  returnPhone?: string | null;
  returnAddress?: string | null;
  returnDistrictId?: number | null;
  returnWardCode?: string | null;
  pickStationId?: number | null;
  deliverStationId?: number | null;
  pickShift?: number[] | null;
}

interface SearchShipmentsRequest {
  keyword?: string;
  orderId?: string;
  status?: ShipmentStatus | "";
  carrier?: ShipmentCarrier | "";
  page?: number;
  size?: number;
}
```

---

## Lưu ý cho developer

1. **BE là source of truth** — Khi có mâu thuẫn giữa FE types và BE response, luôn update FE theo BE contract.
2. **Carrier hiện tại chỉ có GHN** — Type `ShipmentCarrier = "GHN"` nhưng thiết kế cho phép mở rộng.
3. **SubmitShipmentRequest body là optional** — Gọi `submitShipment(id)` không cần body cũng hợp lệ.
4. **Status là string** — BE serialize enum thành string name, không phải integer value.
5. **wardCode là string** — Khác với `provinceId`/`districtId` (number), `wardCode` của GHN là string.
6. **Shipment tự động tạo khi confirm order** — Không có UI standalone cho create shipment, vận đơn được tạo server-side qua `OrderCreatedEvent`.
