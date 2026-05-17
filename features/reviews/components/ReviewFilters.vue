<script setup lang="ts">
import type { ReviewIndexPageState } from "~/features/reviews/composables/useReviewIndexPage";

const props = defineProps<{
  page: ReviewIndexPageState;
}>();

const {
  applyFilters,
  clearFilters,
  hasActiveFilters,
  hiddenStatusOptions,
  localFilters,
  ratingOptions,
} = props.page;
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="w-full sm:flex-1">
        <AppInput
          v-model="localFilters.productId.value"
          label="Product ID"
          placeholder="Filter by product GUID"
          @keyup.enter="applyFilters"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppInput
          v-model="localFilters.userId.value"
          label="User ID"
          placeholder="Filter by user GUID"
          @keyup.enter="applyFilters"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.isHidden.value"
          label="Status"
          :options="hiddenStatusOptions"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.rating.value"
          label="Rating"
          :options="ratingOptions"
        />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <AppButton @click="applyFilters">
        Apply filters
      </AppButton>
      <AppButton v-if="hasActiveFilters" variant="ghost" @click="clearFilters">
        Clear filters
      </AppButton>
    </div>
  </div>
</template>
