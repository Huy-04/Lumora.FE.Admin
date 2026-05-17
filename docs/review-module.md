# Review Module — Admin API Documentation

## Overview

The Review admin module provides review search/listing, moderation (hide/show/delete), and detail viewing. Reviews are managed via the `useReviewAdminApi` composable. The BE is the source of truth for all review data and moderation rules.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/reviews` | Search/filter reviews (paginated) |
| `POST` | `/api/admin/reviews/{reviewId}/hide` | Hide a review from storefront |
| `POST` | `/api/admin/reviews/{reviewId}/show` | Unhide a review (make visible again) |
| `DELETE` | `/api/admin/reviews/{reviewId}` | Permanently delete a review |

---

## Permission Gating

| Action | Required Permission Code |
|--------|--------------------------|
| Search reviews | `Review.Review.Admin.All` |
| View review detail | `Review.Review.Admin.All` |
| Hide / Show review | `Review.Review.Admin.All` |
| Delete review | `Review.Review.Admin.All` |

Enforced on both BE (authorization policies) and FE (UI gating via `useAdminAuthorization`). If the user lacks this permission, review menu items and actions are hidden.

---

## Composable: `useReviewAdminApi`

Located at `features/reviews/composables/useReviewAdminApi.ts`.

```typescript
useReviewAdminApi().searchReviews({ productId?, userId?, isHidden?, rating?, page?, size? })
useReviewAdminApi().hideReview(reviewId, reason?)
useReviewAdminApi().showReview(reviewId)
useReviewAdminApi().deleteReview(reviewId)
```

- `searchReviews` builds query parameters from non-undefined filter values only — undefined/null values are omitted.
- `hideReview` sends an optional `{ reason: string }` body (max 500 chars).
- `showReview` sends an empty POST body.
- `deleteReview` expects HTTP 204 No Content on success.

---

## Search / Filter Pattern

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `productId` | `Guid?` | Filter by product |
| `userId` | `Guid?` | Filter by reviewer |
| `isHidden` | `boolean?` | Filter by visibility (`true` = hidden only, `false` = published only) |
| `rating` | `int?` | Filter by star rating (1–5) |
| `page` | `int` | Page number (default: 1) |
| `size` | `int` | Page size (default: 20, clamped 1–100) |

### Filter Construction

The composable builds the query string by including only non-empty/non-undefined filter values:

```typescript
// Only set filters are included as query params
// Example: { isHidden: true, page: 1, size: 20 }
// → ?isHidden=true&page=1&size=20
```

This is handled by the `useReviewIndexPage` composable which manages filter state and triggers search on filter changes.

---

## Moderation Actions

### Hide Review

1. Admin clicks "Hide" on a review (Published status).
2. Optional reason input (max 500 characters).
3. `hideReview(reviewId, reason?)` → POST `/api/admin/reviews/{reviewId}/hide` with body `{ reason?: string }`.
4. On success: Review status changes to `Hidden`. UI refreshes to show updated status.
5. Hidden reviews are no longer visible on the storefront.

### Show Review

1. Admin clicks "Show" on a hidden review.
2. `showReview(reviewId)` → POST `/api/admin/reviews/{reviewId}/show`.
3. On success: Review status changes to `Published`. UI refreshes.

### Delete Review

1. Admin clicks "Delete" on any review.
2. Confirmation dialog is shown before proceeding.
3. `deleteReview(reviewId)` → DELETE `/api/admin/reviews/{reviewId}`.
4. On success (204): Review is permanently removed. List refreshes.

---

## Page Structure

### Review Index Page (`pages/reviews/index.vue`)

- Uses `useReviewIndexPage` composable for state management.
- Displays paginated table of reviews with columns: ID, user, product, rating, content preview, status, image count, dates.
- Filter panel with productId, userId, isHidden, and rating controls.
- Row click navigates to review detail.

### Review Detail Page (`pages/reviews/[id].vue`)

- Uses `useReviewDetailPage` composable for state management.
- Displays full review data: rating, content, images, status, timestamps.
- Shows moderation action buttons (Hide/Show/Delete) based on current status.
- Hide button visible when status is `Published`.
- Show button visible when status is `Hidden`.
- Delete button always visible.

---

## Response Models

### ReviewResponse

| Field | Type |
|-------|------|
| `id` | `string` (Guid) |
| `userId` | `string` (Guid) |
| `productId` | `string` (Guid) |
| `orderItemId` | `string` (Guid) |
| `rating` | `number` (1–5) |
| `content` | `string \| null` (max 2000) |
| `status` | `"Published" \| "Hidden"` |
| `images` | `ReviewImageResponse[]` |
| `createdBy` | `string` (Guid) |
| `updatedBy` | `string` (Guid) |
| `createdAt` | `string` (DateTime) |
| `updatedAt` | `string` (DateTime) |

### ReviewImageResponse

| Field | Type |
|-------|------|
| `id` | `string` (Guid) |
| `url` | `string` |
| `sortOrder` | `number` |
| `createdAt` | `string` (DateTime) |

### SearchReviewsRequest

| Field | Type |
|-------|------|
| `productId` | `string?` |
| `userId` | `string?` |
| `isHidden` | `boolean?` |
| `rating` | `number?` (1–5) |
| `page` | `number` |
| `size` | `number` |

### HideReviewRequest

| Field | Type |
|-------|------|
| `reason` | `string?` (max 500) |

---

## Error Handling

| Scenario | HTTP Status | Behavior |
|----------|-------------|----------|
| Validation error (hide reason too long) | 400 | Display field error inline |
| Unauthorized | 401 | Auth middleware handles redirect |
| Forbidden (missing permission) | 403 | Actions hidden via permission gating |
| Review not found | 404 | Show "Review not found" toast, refresh list |
| Network / 500 | — | Display generic error notification |

### Loading States

- Search: Table skeleton loader during fetch.
- Moderation actions: Disable action buttons during request.
- Delete: Confirmation dialog blocks until response.
