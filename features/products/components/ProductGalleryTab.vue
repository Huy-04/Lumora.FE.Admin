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

const productApi = useProductAdminApi();

const confirmImageId = ref("");
const actionPending = ref<"" | "remove" | "primary" | "reorder">("");
const actionTargetId = ref("");
const actionError = ref("");
const actionSuccess = ref("");
const dragSourceId = ref("");
const dragTargetId = ref("");
const pendingReorder = ref<null | {
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
}>(null);

const confirmImage = computed(() =>
  props.gallery?.images.find((image) => image.id === confirmImageId.value) ?? null,
);

const confirmImageRemoveBlocked = computed(() =>
  props.productStatus === "Published"
  && Boolean(confirmImage.value)
  && (props.gallery?.images.length ?? 0) <= 1,
);

const blockedImageRemoveMessage = "Published products must keep at least one gallery image. Add another image or move the product out of Published before removing this one.";

const isImageRemoveBlockedByPublishedLastImage = (requestError: unknown) => {
  const problem = getProblemDetails(requestError);
  const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];

  return problem?.status === 409
    && normalizedErrors.some((entry) =>
      entry.field === "ProductStatus" && entry.errorCode === "InvalidStatus");
};

const removeImage = async () => {
  if (!confirmImageId.value) {
    return;
  }

  actionPending.value = "remove";
  actionTargetId.value = confirmImageId.value;
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await productApi.removeProductImage(props.productId, confirmImageId.value);
    actionSuccess.value = "Image removed.";
    confirmImageId.value = "";
    emit("refresh");
  } catch (requestError) {
    actionError.value = isImageRemoveBlockedByPublishedLastImage(requestError)
      ? blockedImageRemoveMessage
      : getProblemMessage(requestError, "Unable to remove the image.");
  } finally {
    actionPending.value = "";
    actionTargetId.value = "";
  }
};

const confirmRemoveImageAction = async () => {
  if (confirmImageRemoveBlocked.value) {
    confirmImageId.value = "";
    return;
  }

  await removeImage();
};

const setPrimary = async (imageId: string) => {
  actionPending.value = "primary";
  actionTargetId.value = imageId;
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await productApi.setPrimaryProductImage(props.productId, imageId);
    actionSuccess.value = "Primary image updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to set the primary image.");
  } finally {
    actionPending.value = "";
    actionTargetId.value = "";
  }
};

const saveOrder = async () => {
  if (!pendingReorder.value || !props.gallery?.images?.length) {
    pendingReorder.value = null;
    return;
  }

  actionPending.value = "reorder";
  actionError.value = "";
  actionSuccess.value = "";

  try {
    const ordered = [...props.gallery.images];
    const sourceIndex = ordered.findIndex((image) => image.id === pendingReorder.value?.sourceId);
    const targetIndex = ordered.findIndex((image) => image.id === pendingReorder.value?.targetId);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      pendingReorder.value = null;
      actionPending.value = "";
      return;
    }

    const [movedImage] = ordered.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    ordered.splice(insertIndex, 0, movedImage);

    const items = ordered.map((image, index) => ({
      imageId: image.id,
      sortOrder: index + 1,
    }));

    await productApi.reorderProductImages(props.productId, { items });
    actionSuccess.value = "Gallery order updated.";
    pendingReorder.value = null;
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to reorder the gallery.");
  } finally {
    actionPending.value = "";
  }
};

const canDragImages = computed(() =>
  props.canReorder
  && (props.gallery?.images.length ?? 0) > 1,
);

const resetDragState = () => {
  dragSourceId.value = "";
  dragTargetId.value = "";
};

const handleImageDragStart = (imageId: string) => {
  if (!canDragImages.value) {
    return;
  }

  dragSourceId.value = imageId;
  dragTargetId.value = "";
};

const handleImageDragOver = (imageId: string) => {
  if (!canDragImages.value || !dragSourceId.value || dragSourceId.value === imageId) {
    return;
  }

  dragTargetId.value = imageId;
};

const handleImageDrop = (targetId: string) => {
  if (!canDragImages.value || !dragSourceId.value || dragSourceId.value === targetId) {
    resetDragState();
    return;
  }

  const sourceImage = props.gallery?.images.find((image) => image.id === dragSourceId.value);
  const targetImage = props.gallery?.images.find((image) => image.id === targetId);

  if (!sourceImage || !targetImage) {
    resetDragState();
    return;
  }

  pendingReorder.value = {
    sourceId: sourceImage.id,
    sourceLabel: sourceImage.alt || `Image ${sourceImage.sortOrder}`,
    targetId: targetImage.id,
    targetLabel: targetImage.alt || `Image ${targetImage.sortOrder}`,
  };

  resetDragState();
};
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

    <AppPanel title="Gallery" description="Manage product gallery imagery, choose the primary storefront product image, update alt text, and control ordering with drag-and-drop.">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-smoke">
          {{ gallery?.images.length ?? 0 }} images in the current gallery.
        </p>
        <NuxtLink
          v-if="canUpdate"
          class="secondary-link"
          :to="`/products/${productId}/gallery/create`"
        >
          Add image
        </NuxtLink>
      </div>

      <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
        You can review gallery assets here, but product update permission is required to manage them.
      </AppNotice>
      <AppNotice v-else-if="!canReorder && (gallery?.images.length ?? 0) > 1" tone="warning" title="Reorder unavailable">
        Product reorder permission is required to drag and reorder gallery images.
      </AppNotice>

      <AppNotice v-if="actionSuccess" tone="success" title="Gallery updated">
        {{ actionSuccess }}
      </AppNotice>

      <AppNotice v-if="actionError" tone="danger" title="Gallery action failed">
        {{ actionError }}
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
    </AppPanel>
  </div>
</template>
