<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ReviewDetailPageState } from "~/features/reviews/composables/useReviewDetailPage";

const props = defineProps<{
  page: ReviewDetailPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  canModifyReviews,
  deleteReview,
  error,
  hideReview,
  isHidden,
  isNotFound,
  isPublished,
  loadErrorMessage,
  pending,
  review,
  reviewId,
  showReview,
} = props.page;

const { formatDateTime } = useAuthPresentation();

useScopedPageBreadcrumbs(() =>
  review.value
    ? [
        { label: "Reviews", to: "/reviews" },
        { label: review.value.id, to: `/reviews/${reviewId.value}` },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="review ? `Review by ${review.userId}` : ''"
    :pending="pending"
    :error="isNotFound ? null : (error ? loadErrorMessage : null)"
    error-title="Unable to load review"
  >
    <!-- 404 Not Found state -->
    <template v-if="isNotFound">
      <AppNotice tone="danger" title="Review not found">
        The requested review does not exist or has been removed.
      </AppNotice>
    </template>

    <template v-else-if="review">
      <div class="grid gap-6 content-start max-w-6xl">
        <!-- Action success/error messages -->
        <AppNotice v-if="actionSuccess" tone="success" title="Success">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Action failed">
          {{ actionError }}
        </AppNotice>

        <!-- Moderation actions -->
        <ReviewModerationActions
          v-if="canModifyReviews"
          :review="review"
          :is-hidden="isHidden"
          :is-published="isPublished"
          :action-pending="actionPending"
          @hide="hideReview"
          @show="showReview"
          @delete="deleteReview"
        />

        <!-- Review details -->
        <AppDetailMetaPanel eyebrow="Review details">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Review ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ review.id }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Status</dt>
            <dd>
              <AppBadge :tone="review.status === 'Published' ? 'success' : 'danger'">
                {{ review.status }}
              </AppBadge>
            </dd>
          </div>
          <div v-if="isHidden && review.hideReason" class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Hide reason</dt>
            <dd class="text-sm text-smoke">{{ review.hideReason }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Rating</dt>
            <dd class="text-sm font-medium text-ink">{{ review.rating }} / 5</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Content</dt>
            <dd class="text-sm text-smoke">{{ review.content ?? "None" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">User ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ review.userId }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Product ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ review.productId }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Order item ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ review.orderItemId }}</dd>
          </div>
        </AppDetailMetaPanel>

        <!-- Review images -->
        <AppDetailMetaPanel v-if="review.images.length > 0" eyebrow="Images">
          <div class="flex flex-wrap gap-3 py-3">
            <a
              v-for="image in review.images"
              :key="image.id"
              :href="image.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block overflow-hidden rounded-lg border border-line"
            >
              <img
                :src="image.url"
                :alt="`Review image ${image.sortOrder}`"
                class="h-24 w-24 object-cover"
              />
            </a>
          </div>
        </AppDetailMetaPanel>

        <!-- Audit trail -->
        <AppDetailMetaPanel eyebrow="Audit trail">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(review.createdAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created by</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ review.createdBy }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(review.updatedAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated by</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ review.updatedBy }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
