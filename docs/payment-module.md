# Payment Module — Admin API Documentation

## API Route Prefix

All admin payment endpoints use the prefix:

```
/admin/payments/...
```

The Nuxt proxy strips `/api`, so FE calls `/admin/payments/...` which maps to BE `api/admin/payments/...`.

> **Note:** The BE docs reference `/api/payments/...` for admin routes — this is incorrect. The BE source (`PaymentsController`) uses `[Route("api/admin/payments")]`.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/payments/search` | Search/filter payments (paginated) |
| `GET` | `/admin/payments/{paymentId}` | Get payment detail by payment ID |
| `GET` | `/admin/payments/orders/{orderId}` | Get payment detail by order ID |
| `POST` | `/admin/payments/orders/{orderId}/manual-success` | Mark payment as succeeded (manual) |
| `POST` | `/admin/payments/orders/{orderId}/manual-failed` | Mark payment as failed (manual) |

---

## Permission Gating

| Action | Required Permission Code |
|--------|--------------------------|
| Search payments | `Payment.Payment.Read.All` |
| View payment detail | `Payment.Payment.Read.All` |
| Manual success / manual failed | `Payment.Payment.Modify.All` |

These are enforced both on the BE (authorization policies) and on the FE (UI gating via `useAdminAuthorization`).

---

## Manual Action Flow

Manual success and manual failed are admin-only operational fallbacks for resolving stuck payments.

**Preconditions:**

- Payment status must be **Pending** or **Processing**
- User must have `Payment.Payment.Modify.All` permission

**Behaviour:**

1. Admin opens payment detail page (`/payments/[id]`)
2. If payment status is Pending or Processing, manual action buttons are visible
3. Admin clicks "Mark Success" or "Mark Failed"
4. FE calls `POST /admin/payments/orders/{orderId}/manual-success` or `manual-failed`
5. On success: payment detail refreshes to show updated status
6. On error: error message is displayed inline — dialog stays open for retry

**Not available when:**

- Payment status is `Succeeded` or `Failed` (already finalized)

---

## Search Filters

| Query Param | Type | Description |
|-------------|------|-------------|
| `keyword` | `string?` | Text search |
| `userId` | `Guid?` | Filter by user |
| `orderId` | `Guid?` | Filter by order |
| `status` | `PaymentStatusFilter?` | Pending, Processing, Succeeded, Failed |
| `method` | `PaymentMethodFilter?` | COD, PayOs |
| `provider` | `PaymentProviderFilter?` | None, PayOs |
| `createdFrom` | `DateTime?` | Date range start |
| `createdTo` | `DateTime?` | Date range end |
| `page` | `int` | Page number (default: 1) |
| `size` | `int` | Page size (default: 20) |

---

## Response Models

### PaymentSummaryResponse (search results)

| Field | Type |
|-------|------|
| `id` | `Guid` |
| `orderId` | `Guid` |
| `userId` | `Guid` |
| `method` | `string` — "COD" or "PayOs" |
| `provider` | `string` — "None" or "PayOs" |
| `status` | `string` — "Pending", "Processing", "Succeeded", "Failed" |
| `amount` | `decimal` |
| `currency` | `string` |
| `succeededAt` | `DateTime?` |
| `failedAt` | `DateTime?` |
| `failureCode` | `string?` |
| `failureMessage` | `string?` |

### PaymentResponse (detail, extends summary)

Additional fields:

| Field | Type |
|-------|------|
| `orderNumber` | `string` |
| `attempts` | `PaymentAttemptResponse[]` |
| `createdBy` | `Guid` |
| `updatedBy` | `Guid` |
| `createdAt` | `DateTime` |
| `updatedAt` | `DateTime` |

### PaymentAttemptResponse

| Field | Type |
|-------|------|
| `id` | `Guid` |
| `attemptNo` | `int` |
| `status` | `string` — "Pending", "RedirectIssued", "ReturnReceived", "Succeeded", "Failed", "Expired" |
| `txnRef` | `string` |
| `providerTransactionNo` | `string?` |
| `amount` | `decimal` |
| `issuedAt` | `DateTime` |
| `expiresAt` | `DateTime` |
| `returnedAt` | `DateTime?` |
| `ipnReceivedAt` | `DateTime?` |
| `providerResponseCode` | `string?` |
| `providerTransactionStatus` | `string?` |
| `bankCode` | `string?` |
| `providerPayDate` | `DateTime?` |
| `failureCode` | `string?` |
| `failureMessage` | `string?` |
