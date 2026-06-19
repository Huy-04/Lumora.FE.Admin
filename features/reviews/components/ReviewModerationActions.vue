<script setup lang="ts">
import type { ReviewResponse } from "~/features/reviews/types/reviews";

const props = defineProps<{
  review: ReviewResponse;
  isHidden: boolean;
  isPublished: boolean;
  actionPending: string;
}>();

const emit = defineEmits<{
  hide: [reason?: string];
  show: [];
  delete: [];
}>();

const hideReason = ref("");
const showDeleteConfirm = ref(false);

const isActionDisabled = computed(() => props.actionPending !== "");

const handleHide = () => {
  emit("hide", hideReason.value || undefined);
  hideReason.value = "";
};

const handleShow = () => {
  emit("show");
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  showDeleteConfirm.value = false;
  emit("delete");
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};
</script>

<template>
  <AppPanel eyebrow="Moderation actions">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <AppBadge :tone="isPublished ? 'success' : 'danger'">
            {{ review.status }}
          </AppBadge>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <AppButton
            v-if="isPublished"
            :loading="actionPending === 'hide'"
            :disabled="isActionDisabled"
            variant="secondary"
            @click="handleHide"
          >
            Hide review
          </AppButton>

          <AppButton
            v-if="isHidden"
            :loading="actionPending === 'show'"
            :disabled="isActionDisabled"
            variant="secondary"
            @click="handleShow"
          >
            Show review
          </AppButton>

          <AppButton
            :loading="actionPending === 'delete'"
            :disabled="isActionDisabled"
            variant="danger"
            @click="confirmDelete"
          >
            Delete review
          </AppButton>
        </div>
      </div>

      <!-- Hide reason input (shown for Published reviews) -->
      <div v-if="isPublished" class="max-w-md">
        <AppInput
          v-model="hideReason"
          label="Hide reason (optional)"
          placeholder="Enter reason for hiding this review"
          :maxlength="500"
        />
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <AppConfirm
      :open="showDeleteConfirm"
      title="Delete review"
      detail="This action is permanent and cannot be undone. Are you sure you want to delete this review?"
      confirm-label="Delete"
      cancel-label="Cancel"
      tone="danger"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </AppPanel>
</template>
