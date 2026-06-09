<script setup lang="ts">
import type { ProductGalleryResponse, ProductStatus } from "~/features/products/types";

const props = defineProps<{
  productId: string;
  productStatus: ProductStatus;
  gallery: ProductGalleryResponse | null;
  canUpdate: boolean;
  canReorder: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
  actionError,
  actionErrorOpen,
  actionPending,
  actionTargetId,
  blockedImageRemoveMessage,
  canDragImages,
  closeActionError,
  confirmImage,
  confirmImageId,
  confirmImageRemoveBlocked,
  confirmRemoveImageAction,
  dragSourceId,
  dragTargetId,
  handleImageDragOver,
  handleImageDragStart,
  handleImageDrop,
  pendingReorder,
  resetDragState,
  saveOrder,
  setPrimary,
} = useProductGalleryTab(props, () => emit("refresh"));
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppConfirm
      :open="pendingReorder !== null"
      :title="pendingReorder ? `Move ${pendingReorder.sourceLabel}?` : ''"
      :detail="pendingReorder ? `Place this image before ${pendingReorder.targetLabel}. The gallery order will be updated after confirmation.` : ''"
      confirm-label="Save order"
      :loading="actionPending === 'reorder'"
      @confirm="saveOrder"
      @cancel="pendingReorder = null"
    />
    <AppConfirm
      :open="confirmImage !== null"
      :title="confirmImageRemoveBlocked ? 'Cannot remove image' : confirmImage ? 'Remove image?' : ''"
      :detail="confirmImageRemoveBlocked ? blockedImageRemoveMessage : 'This action removes the image from the product gallery.'"
      :cancel-label="confirmImageRemoveBlocked ? 'Close' : 'Cancel'"
      :hide-confirm="confirmImageRemoveBlocked"
      :confirm-label="confirmImageRemoveBlocked ? '' : 'Remove'"
      :tone="confirmImageRemoveBlocked ? 'warning' : 'danger'"
      :loading="actionPending === 'remove'"
      @confirm="confirmRemoveImageAction"
      @cancel="confirmImageId = ''"
    />
    <AppConfirm
      :open="actionErrorOpen"
      title="Gallery action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <AppPanel eyebrow="Gallery">
      <div class="mb-6">
        <p class="text-sm text-smoke">
          {{ gallery?.images.length ?? 0 }} images in the current gallery.
        </p>
      </div>

      <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
        You can review gallery assets here, but product update permission is required to manage them.
      </AppNotice>
      <AppNotice v-else-if="!canReorder && (gallery?.images.length ?? 0) > 1" tone="warning" title="Reorder unavailable">
        Product reorder permission is required to drag and reorder gallery images.
      </AppNotice>

      <div v-if="gallery?.images.length" class="table-shell overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th class="min-w-[120px] text-center">Image</th>
              <th class="min-w-[320px]">Alt text</th>
              <th class="min-w-[90px]">Sort</th>
              <th class="min-w-[140px] text-center">Primary</th>
              <th class="w-[110px] text-center">Open</th>
              <th v-if="canUpdate" class="w-[120px] text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="image in gallery.images"
              :key="image.id"
              :draggable="canDragImages"
              :class="{
                'cursor-grab': canDragImages,
                'opacity-55': dragSourceId === image.id,
                'bg-moss/10': dragTargetId === image.id,
              }"
              @dragstart="handleImageDragStart(image.id)"
              @dragend="resetDragState"
              @dragover.prevent="handleImageDragOver(image.id)"
              @drop.prevent="handleImageDrop(image.id)"
            >
              <td class="align-middle">
                <div class="flex items-center justify-center">
                  <img
                    :src="image.img"
                    :alt="image.alt || 'Product gallery image'"
                    class="h-20 w-20 rounded-lg border border-line/60 object-cover"
                  >
                </div>
              </td>
              <td class="align-middle">
                <p class="text-sm text-smoke">{{ image.alt || "Not set" }}</p>
              </td>
              <td class="align-middle">
                <span>{{ image.sortOrder }}</span>
              </td>
              <td class="align-middle">
                <div class="flex justify-center">
                  <AppBadge v-if="image.isPrimary" tone="success">
                    Primary
                  </AppBadge>
                  <AppButton
                    v-else-if="canUpdate"
                    class="table-action whitespace-nowrap"
                    variant="secondary"
                    :loading="actionPending === 'primary' && actionTargetId === image.id"
                    @click="setPrimary(image.id)"
                  >
                    Set primary
                  </AppButton>
                  <AppBadge v-else tone="default">
                    Secondary
                  </AppBadge>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex justify-center">
                  <NuxtLink
                    class="secondary-link table-action"
                    :to="`/products/${productId}/gallery/${image.id}`"
                  >
                    Open
                  </NuxtLink>
                </div>
              </td>
              <td v-if="canUpdate" class="align-middle">
                <div class="flex justify-center">
                  <AppButton class="table-action" variant="danger" @click="confirmImageId = image.id">
                    Remove
                  </AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppEmptyState
        v-else
        title="No gallery images yet"
        detail="Create the first gallery image to build the product's storefront gallery."
      />

      <div v-if="canUpdate" class="mt-4 flex justify-end border-t border-line/70 pt-4">
        <NuxtLink
          class="secondary-link"
          :to="`/products/${productId}/gallery/create`"
        >
          Add image
        </NuxtLink>
      </div>
    </AppPanel>
  </div>
</template>
