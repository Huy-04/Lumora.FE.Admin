<script setup lang="ts">
import type { ReviewIndexPageState } from "~/features/reviews/composables/useReviewIndexPage";

const props = defineProps<{
  page: ReviewIndexPageState;
}>();

const {
  applyFilters,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  hasActiveFilters,
  hiddenStatusOptions,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  ratingOptions,
  reviews,
  summaryStats,
  totalPages,
  totalReviews,
} = props.page;

function truncateContent(content: string | null, maxLength = 60): string {
  if (!content) return "None";
  return content.length > maxLength ? `${content.slice(0, maxLength)}...` : content;
}

function reviewDetailLink(review: { id: string }) {
  return `/reviews/${review.id}`;
}
</script>

<template>
  <AppIndexPage
    v-model="localFilters.productId.value"
    eyebrow="Moderation"
    search-label="Search by product ID"
    search-placeholder="Enter a product ID"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="reviews"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :items-length="reviews.length"
    empty-title="No reviews found"
    empty-detail="Adjust filters or wait for customers to leave reviews."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    v-model:page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @search="applyFilters"
    @refresh="clearFilters"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #notices>
      <AppNotice v-if="error" tone="danger" title="Unable to load data">
        {{ loadErrorMessage }}
      </AppNotice>
    </template>

    <template #filters>
      <div class="w-full flex flex-col gap-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="w-full sm:flex-1">
            <AppInput v-model="localFilters.productId.value" label="Product ID" placeholder="Filter by product ID" @keyup.enter="applyFilters" />
          </div>
          <div class="w-full sm:flex-1">
            <AppInput v-model="localFilters.userId.value" label="User ID" placeholder="Filter by user ID" @keyup.enter="applyFilters" />
          </div>
          <div class="w-full sm:flex-1">
            <AppSelect v-model="localFilters.isHidden.value" label="Status" :options="hiddenStatusOptions" />
          </div>
          <div class="w-full sm:flex-1">
            <AppSelect v-model="localFilters.rating.value" label="Rating" :options="ratingOptions" />
          </div>
        </div>
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[1040px]">
        <thead>
          <tr>
            <th class="min-w-[190px]">Review ID</th>
            <th class="min-w-[130px]">User</th>
            <th class="min-w-[130px]">Product</th>
            <th class="min-w-[80px]">Rating</th>
            <th class="min-w-[200px]">Content</th>
            <th class="min-w-[100px]">Status</th>
            <th class="min-w-[60px] text-center">Images</th>
            <th class="min-w-[150px]">Created</th>
            <th class="min-w-[150px]">Updated</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id">
            <td>
              <p class="table-title">{{ review.id }}</p>
            </td>
            <td>{{ review.userId }}</td>
            <td>{{ review.productId }}</td>
            <td>{{ review.rating }} / 5</td>
            <td>
              <p class="text-sm text-gray-600">{{ truncateContent(review.content) }}</p>
            </td>
            <td>
              <AppBadge :tone="review.status === 'Published' ? 'success' : 'danger'">
                {{ review.status }}
              </AppBadge>
            </td>
            <td class="text-center">{{ review.images.length }}</td>
            <td>{{ new Date(review.createdAt).toLocaleString() }}</td>
            <td>{{ new Date(review.updatedAt).toLocaleString() }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="reviewDetailLink(review)">
                  Open
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
