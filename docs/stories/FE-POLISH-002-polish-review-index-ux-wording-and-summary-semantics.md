# FE-POLISH-002 - Polish Review index UX wording and summary semantics

## Summary

Polish the residual Review index UX after semantic audit closure. Keep behavior and FE-BE contract unchanged while making search wording and page-local summary messaging match what the current FE actually binds and counts.

## Scope

- `features/reviews/composables/useReviewIndexPage.ts`
- `features/reviews/components/ReviewIndexView.vue`

## Why

`Review` is semantics-clean after `FE-AUDIT-019`, but two residual UX issues remain:

1. The top search box binds `productId`, while its placeholder currently suggests a combined `Product ID or User ID` search.
2. The Published/Hidden summary cards count current page items, but their wording reads like broader storefront-wide totals.

## Intended outcome

- Make top search wording reflect the real `productId` binding.
- Make summary-card detail text clearly page-local where counts are page-local.
- Do not change API requests, filters, pagination, or moderation semantics.

## Risk

- GitNexus impact:
  - `useReviewIndexPage`: `LOW`
  - `ReviewIndexView.vue`: `LOW`
- Expected blast radius is limited to `pages/reviews/index.vue`.

## Verification

- `npx.cmd nuxt prepare`
- `npm.cmd run build`
