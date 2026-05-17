# Product Module — FE Admin Documentation

This document describes the verified endpoint mappings, business rules, and constraints for the Product module in the FE Admin application. The BE API is the source of truth.

---

## Table of Contents

- [1. Endpoint Mappings](#1-endpoint-mappings)
  - [1.1 Products Controller](#11-products-controller)
  - [1.2 Variants Controller](#12-variants-controller)
  - [1.3 Gallery Controller](#13-gallery-controller)
  - [1.4 Assets Controller](#14-assets-controller)
  - [1.5 Attributes Controller](#15-attributes-controller)
  - [1.6 Catalog Controller](#16-catalog-controller)
- [2. Product Lifecycle Status Machine](#2-product-lifecycle-status-machine)
- [3. Asset Upload Constraints](#3-asset-upload-constraints)
- [4. Variant SKU Validation Rules](#4-variant-sku-validation-rules)
- [5. Response Models Reference](#5-response-models-reference)
- [6. Error Handling](#6-error-handling)

---

## 1. Endpoint Mappings

### 1.1 Products Controller

**Base route:** `api/products`  
**Auth:** All endpoints require authentication (`[Authorize]`)

| # | Method | Path | Purpose | Response |
|---|--------|------|---------|----------|
| 1 | GET | `/api/products` | List products (paginated) | `PaginatedResponse<ProductResponse>` |
| 2 | GET | `/api/products/all` | List all including soft-deleted | `PaginatedResponse<ProductResponse>` |
| 3 | GET | `/api/products/search` | Search/filter products | `PaginatedResponse<ProductResponse>` |
| 4 | GET | `/api/products/{id}` | Get by ID | `ProductResponse` |
| 5 | GET | `/api/products/slug/{slug}` | Get by slug | `ProductResponse` |
| 6 | GET | `/api/products/category/{categoryId}` | Get by category (paginated) | `PaginatedResponse<ProductResponse>` |
| 7 | POST | `/api/products` | Create product | `201` — `ProductResponse` |
| 8 | PUT | `/api/products/{id}` | Update product | `ProductResponse` |
| 9 | DELETE | `/api/products/{id}` | Soft-delete | `204 No Content` |
| 10 | POST | `/api/products/reorder` | Reorder products | `204 No Content` |
| 11 | POST | `/api/products/{id}/publish` | Publish (Draft → Published) | `ProductResponse` |
| 12 | POST | `/api/products/{id}/unpublish` | Unpublish (Published → Draft) | `ProductResponse` |
| 13 | POST | `/api/products/{id}/discontinue` | Discontinue (Published → Discontinued) | `ProductResponse` |
| 14 | **PATCH** | `/api/products/{id}/republish` | Republish (Discontinued → Published) | `ProductResponse` |
| 15 | POST | `/api/products/{id}/restore` | Restore soft-deleted → Draft | `ProductResponse` |
| 16 | POST | `/api/products/{id}/mark-featured` | Mark as featured | `ProductResponse` |
| 17 | POST | `/api/products/{id}/unmark-featured` | Unmark featured | `ProductResponse` |

**Search query parameters:**
`keyword`, `slug`, `categoryId`, `status` (0=Draft, 1=Published, 2=Discontinued), `genderTarget` (0=Unisex, 1=Female, 2=Male), `isFeatured`, `isDeleted`, `page` (default 1), `size` (default 20)

> **Important:** Republish uses `PATCH` (not POST like other lifecycle actions).

---

### 1.2 Variants Controller

**Base route:** `api/products/{productId}/variants`  
**Auth:** Required

| # | Method | Path | Purpose | Response |
|---|--------|------|---------|----------|
| 1 | GET | `.../variants` | List variants for product | `ProductVariantResponse[]` |
| 2 | POST | `.../variants` | Add variant | `ProductResponse` |
| 3 | PUT | `.../variants/{variantId}` | Update variant | `ProductResponse` |
| 4 | DELETE | `.../variants/{variantId}` | Remove variant | `ProductResponse` |
| 5 | POST | `.../variants/{variantId}/set-default` | Set default variant | `ProductResponse` |
| 6 | POST | `.../variants/{variantId}/status` | Change status | `ProductResponse` |
| 7 | POST | `.../variants/reorder` | Reorder variants | `ProductResponse` |

> **Note:** All mutation endpoints return the full `ProductResponse` (not `ProductVariantResponse`).  
> GET returns a flat array `ProductVariantResponse[]` (not wrapped in a parent object).

---

### 1.3 Gallery Controller

**Base route:** `api/products/{productId}/gallery`  
**Auth:** Required

| # | Method | Path | Purpose | Response |
|---|--------|------|---------|----------|
| 1 | GET | `.../gallery` | Get gallery | `ProductGalleryResponse` |
| 2 | POST | `.../gallery` | Add image | `ProductGalleryResponse` |
| 3 | DELETE | `.../gallery/{imageId}` | Remove image | `ProductGalleryResponse` |
| 4 | PUT | `.../gallery/{imageId}` | Update image (asset + alt) | `ProductGalleryResponse` |
| 5 | PUT | `.../gallery/{imageId}/alt` | Update alt text only | `ProductGalleryResponse` |
| 6 | POST | `.../gallery/{imageId}/set-primary` | Set primary image | `ProductGalleryResponse` |
| 7 | POST | `.../gallery/reorder` | Reorder images | `ProductGalleryResponse` |

---

### 1.4 Assets Controller

**Base route:** `api/products/{productId}/assets`  
**Auth:** Required

| # | Method | Path | Purpose | Response |
|---|--------|------|---------|----------|
| 1 | GET | `.../assets` | Get all assets | `ProductAssetsResponse` |
| 2 | POST | `.../assets` | Upload single (multipart) | `201` — `ProductAssetResponse` |
| 3 | POST | `.../assets/batch` | Upload batch (multipart) | `ProductAssetsResponse` |
| 4 | DELETE | `.../assets/{assetId}` | Remove single asset | `204 No Content` |
| 5 | POST | `.../assets/remove-batch` | Remove batch | `204 No Content` |

---

### 1.5 Attributes Controller

**Base route:** `api/products/{productId}/attributes`  
**Auth:** Required

| # | Method | Path | Purpose | Response |
|---|--------|------|---------|----------|
| 1 | GET | `.../attributes` | Get attributes | `ProductAttributeResponse` |
| 2 | POST | `.../attributes/skin-types/{skinType}` | Add skin type (int enum) | `ProductAttributeResponse` |
| 3 | DELETE | `.../attributes/skin-types/{skinType}` | Remove skin type | `ProductAttributeResponse` |
| 4 | POST | `.../attributes/skin-concerns/{skinConcern}` | Add skin concern (int enum) | `ProductAttributeResponse` |
| 5 | DELETE | `.../attributes/skin-concerns/{skinConcern}` | Remove skin concern | `ProductAttributeResponse` |

---

### 1.6 Catalog Controller

**Base route:** `api/catalog/products`  
**Auth:** None (public endpoints)

| # | Method | Path | Purpose | Response |
|---|--------|------|---------|----------|
| 1 | GET | `/api/catalog/products/search` | Public catalog search | `PaginatedResponse<ProductPublicResponse>` |
| 2 | GET | `/api/catalog/products/{slug}` | Detail by slug | `ProductPublicDetailResponse` |
| 3 | GET | `/api/catalog/products/by-variant/{variantId}` | Detail by variant ID | `ProductPublicDetailResponse` |
| 4 | GET | `/api/catalog/products/id/{productId}` | Detail by product ID | `ProductPublicDetailResponse` |

**Catalog search query parameters:**
`keyword`, `slug`, `categoryId`, `genderTarget`, `isFeatured`, `sort` (default "default"), `minPrice`, `maxPrice`, `page`, `size`

---

## 2. Product Lifecycle Status Machine

### State Diagram

```
  [New] ──► Draft ──────► Published ──────► Discontinued
              │        (publish)       (discontinue)   │
              │              │                         │
              │              │ (unpublish)             │ (republish - PATCH)
              │              ▼                         │
              │           Draft                        ▼
              │                                   Published
              │
              └──── soft-delete from any status ──────► Deleted (isDeleted=true)
                                                             │
                                                             │ (restore)
                                                             ▼
                                                           Draft
```

### Transition Table

| Action | HTTP | From Status | To Status | Preconditions |
|--------|------|-------------|-----------|---------------|
| Publish | `POST .../publish` | Draft | Published | ≥1 active variant, ≥1 gallery image, not deleted |
| Unpublish | `POST .../unpublish` | Published | Draft | Not deleted |
| Discontinue | `POST .../discontinue` | Published | Discontinued | Not deleted |
| Republish | `PATCH .../republish` | Discontinued | Published | ≥1 active variant, ≥1 gallery image, not deleted |
| Soft-delete | `DELETE /api/products/{id}` | Any | isDeleted=true | Idempotent |
| Restore | `POST .../restore` | isDeleted=true | Draft | Slug must still be free |

### UI Gating Rules

The FE Admin must conditionally show/hide actions based on product state:

| Current State | Allowed UI Actions |
|---------------|-------------------|
| **Draft** | Edit all fields, publish, upload assets/content, delete |
| **Published** | Unpublish, discontinue, mark/unmark featured, delete |
| **Discontinued** | Republish, delete. All other publish-like actions disabled |
| **Deleted** (isDeleted=true) | Restore only. Hide all edit/destructive actions |

**Key gating notes:**
- Publish requires at least 1 active variant AND at least 1 gallery image
- Republish has the same preconditions as publish
- Featured toggling is only available on Published products
- Deleted products should only show the restore action

---

## 3. Asset Upload Constraints

### Allowed File Types

| MIME Type | Extension |
|-----------|-----------|
| `image/jpeg` | .jpg, .jpeg |
| `image/png` | .png |
| `image/webp` | .webp |

### Size Limits

| Constraint | Value |
|-----------|-------|
| Max file size per file | **5 MB** |
| Max files per batch upload | **10** |

### Upload Behavior

- **Single upload** (`POST .../assets`): multipart/form-data with field `file`. Returns `201 Created`.
- **Batch upload** (`POST .../assets/batch`): multipart/form-data with field `files`. Returns `200 OK`.
- Empty files are filtered out server-side; if none remain → validation error.
- Content-type must match file extension.

### Removal Rules

- Cannot remove an asset still referenced by a variant (`productAssetId`) or gallery image.
- Single removal: `DELETE .../assets/{assetId}` → `204`.
- Batch removal: `POST .../assets/remove-batch` with `{ "assetIds": [...] }` → `204`.

### Client-Side Validation Checklist

1. Reject files not matching `image/jpeg`, `image/png`, `image/webp`
2. Reject files exceeding 5 MB
3. Reject batch uploads exceeding 10 files
4. Show user-friendly error before uploading invalid files

---

## 4. Variant SKU Validation Rules

### Format Rules

| Rule | Specification |
|------|--------------|
| Length | **3–50 characters** |
| Allowed characters | **Uppercase letters (A-Z), digits (0-9), dash (-)** |
| Whitespace | No leading or trailing whitespace |
| Uniqueness | Globally unique across all products |
| Submission | Must be submitted in canonical form (FE responsibility) |

### Regex Pattern

```
^[A-Z0-9][A-Z0-9\-]{1,48}[A-Z0-9]$
```

This ensures: minimum 3 chars, no leading/trailing dash, only uppercase alpha-numeric with internal dashes.

### Additional Variant Business Rules

| Rule | Detail |
|------|--------|
| Max variants per product | 20 |
| Default variant | First added becomes default automatically |
| Default must be active | Cannot deactivate the default variant |
| Removing default | Promotes next active variant by sort order; if none → rejected |
| `productAssetId` | Must belong to the same product (if provided) |
| Price | Strictly positive (> 0, zero rejected) |
| Dimensions (weight, length, width, height) | Strictly positive integers (> 0) |
| Status values | `"Active"` or `"Inactive"` |

---

## 5. Response Models Reference

### ProductResponse (Admin)

```typescript
interface ProductResponse {
  id: string;
  categoryId: string;
  name: string;
  brand: string;
  slug: string;
  content: ProductContentResponse;
  img: string | null;
  sortOrder: number;
  status: "Draft" | "Published" | "Discontinued";
  isFeatured: boolean;
  genderTarget: "Unisex" | "Female" | "Male";
  seoTitle: string | null;
  seoDescription: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### ProductContentResponse

```typescript
interface ProductContentResponse {
  shortDescription: string | null;
  description: string | null;
  highlights: string | null;
  ingredients: string | null;
  howToUse: string | null;
  storageGuide: string | null;
  caution: string | null;
  brandOrigin: string | null;
  manufactureLocation: string | null;
  manufactureDateNote: string | null;
  shelfLifeNote: string | null;
}
```

### ProductVariantResponse

```typescript
interface ProductVariantResponse {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  weight: number;
  length: number;
  width: number;
  height: number;
  sortOrder: number;
  isDefault: boolean;
  status: "Active" | "Inactive";
  productAssetId: string | null;
  img: string | null;
}
```

### ProductGalleryResponse

```typescript
interface ProductGalleryResponse {
  id: string;
  productId: string;
  images: ProductImageResponse[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductImageResponse {
  id: string;
  img: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}
```

### ProductAssetsResponse

```typescript
interface ProductAssetsResponse {
  productId: string;
  assets: ProductAssetResponse[];
}

interface ProductAssetResponse {
  id: string;
  productId: string;
  img: string;
  storagePath: string;
}
```

### ProductAttributeResponse

```typescript
interface ProductAttributeResponse {
  id: string;
  productId: string;
  skinTypes: string[];
  skinConcerns: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### PaginatedResponse\<T\>

```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;       // 1-based
  size: number;
  totalPages: number;
}
```

---

## 6. Error Handling

### ProblemDetails Format

```typescript
interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errorCategory?: string;
  errors?: CustomErrorDetail[];
}

interface CustomErrorDetail {
  field: string;
  errorCode: string;
  parameter?: unknown;
}
```

### Error Category Handling

| Error Category | HTTP Status | FE Behavior |
|---------------|-------------|-------------|
| ValidationFailed | 400 | Keep form open, map field-level errors |
| Unauthorized | 401 | Trigger refresh/relogin flow |
| Forbidden | 403 | Show no-permission state |
| NotFound | 404 | Show missing record message or return to list |
| Conflict | 409 | Show conflict message, refetch data |
| InternalServerError | 500 | Show generic failure with traceId |

### Common Product Error Codes

- Unique slug conflict → `409` with `field: "Resource"`, `errorCode: "AlreadyExists"`
- Invalid file type → `400` with `field: "ContentType"`, `errorCode: "InvalidFormat"`
- Batch size exceeded → `400` with `field: "Files"`, `errorCode: "ExceedsMaximum"`
- Rate limit → `429` — show retry-later message, no auto-retry loops
