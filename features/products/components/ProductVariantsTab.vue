<script setup lang="ts">
import type { ProductStatus, ProductVariantResponse } from "~/features/products/types";

const props = defineProps<{
  productId: string;
  productStatus: ProductStatus;
  variants: ProductVariantResponse[];
  canUpdate: boolean;
  canReorder: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const productApi = useProductAdminApi();
const { parseRequiredInt } = useNumericForm();

const confirmVariantId = ref("");
const actionPending = ref<"" | "remove" | "default" | "status" | "reorder">("");
const actionTargetId = ref("");
const actionError = ref("");
const dragSourceId = ref("");
const dragTargetId = ref("");
const pendingReorder = ref<null | {
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
}>(null);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

const confirmVariant = computed(() =>
  props.variants.find((variant) => variant.id === confirmVariantId.value) ?? null,
);

const blockedStatusVariantId = ref("");

const blockedStatusVariant = computed(() =>
  props.variants.find((variant) => variant.id === blockedStatusVariantId.value) ?? null,
);

const activeVariantCount = computed(() =>
  props.variants.filter((variant) => variant.status === "Active").length,
);

const canDragVariants = computed(() =>
  props.canReorder
  && props.variants.length > 1,
);

const publishedVariantStatusMessage = "Published products must keep at least one active variant. Activate another variant or move the product out of Published before deactivating this one.";
const defaultVariantStatusMessage = "Default variants must stay active. Set another default variant before deactivating this one.";

const isDeactivateBlocked = (variant: ProductVariantResponse) =>
  props.productStatus === "Published"
  && variant.status === "Active"
  && activeVariantCount.value <= 1;

const isRemoveBlocked = (variant: ProductVariantResponse) =>
  props.productStatus === "Published"
  && variant.status === "Active"
  && activeVariantCount.value <= 1;

const getVariantStatusErrorMessage = (error: unknown) => {
  const problem = getProblemDetails(error);
  const hasActiveVariantRule = problem?.status === 409
    && Array.isArray(problem.errors)
    && problem.errors.some((entry) => entry.field === "VariantStatus" && entry.errorCode === "InvalidStatus");

  if (hasActiveVariantRule) {
    return publishedVariantStatusMessage;
  }

  const hasDefaultVariantRule = problem?.status === 409
    && Array.isArray(problem.errors)
    && problem.errors.some((entry) => entry.field === "VariantIsDefault" && entry.errorCode === "InvalidStatus");

  if (hasDefaultVariantRule) {
    return defaultVariantStatusMessage;
  }

  return getProblemMessage(error, "Unable to update the variant status.");
};

const removeVariant = async () => {
  if (!confirmVariantId.value) {
    return;
  }

  if (confirmVariant.value && isRemoveBlocked(confirmVariant.value)) {
    blockedStatusVariantId.value = confirmVariantId.value;
    confirmVariantId.value = "";
    return;
  }

  actionPending.value = "remove";
  actionTargetId.value = confirmVariantId.value;
  actionError.value = "";

  try {
    await productApi.removeProductVariant(props.productId, confirmVariantId.value);
    confirmVariantId.value = "";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to remove the variant.");
  } finally {
    actionPending.value = "";
    actionTargetId.value = "";
  }
};

const setDefault = async (variantId: string) => {
  actionPending.value = "default";
  actionTargetId.value = variantId;
  actionError.value = "";

  try {
    await productApi.setProductDefaultVariant(props.productId, variantId);
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to change the default variant.");
  } finally {
    actionPending.value = "";
    actionTargetId.value = "";
  }
};

const updateStatus = async (variantId: string) => {
  const variant = props.variants.find((entry) => entry.id === variantId);

  if (!variant) {
    return;
  }

  actionPending.value = "status";
  actionTargetId.value = variantId;
  actionError.value = "";

  if (isDeactivateBlocked(variant)) {
    blockedStatusVariantId.value = variantId;
    actionPending.value = "";
    actionTargetId.value = "";
    return;
  }

  try {
    await productApi.changeProductVariantStatus(props.productId, variantId, {
      status: parseRequiredInt(variant.status === "Active" ? "1" : "0", "Variant status"),
    });
    emit("refresh");
  } catch (requestError) {
    actionError.value = getVariantStatusErrorMessage(requestError);
  } finally {
    actionPending.value = "";
    actionTargetId.value = "";
  }
};

const resetDragState = () => {
  dragSourceId.value = "";
  dragTargetId.value = "";
};

const handleVariantDragStart = (variantId: string) => {
  if (!canDragVariants.value) {
    return;
  }

  dragSourceId.value = variantId;
  dragTargetId.value = "";
};

const handleVariantDragOver = (variantId: string) => {
  if (!canDragVariants.value || !dragSourceId.value || dragSourceId.value === variantId) {
    return;
  }

  dragTargetId.value = variantId;
};

const handleVariantDrop = (targetId: string) => {
  if (!canDragVariants.value || !dragSourceId.value || dragSourceId.value === targetId) {
    resetDragState();
    return;
  }

  const sourceVariant = props.variants.find((variant) => variant.id === dragSourceId.value);
  const targetVariant = props.variants.find((variant) => variant.id === targetId);

  if (!sourceVariant || !targetVariant) {
    resetDragState();
    return;
  }

  pendingReorder.value = {
    sourceId: sourceVariant.id,
    sourceName: sourceVariant.name,
    targetId: targetVariant.id,
    targetName: targetVariant.name,
  };

  resetDragState();
};

const buildReorderItems = () => {
  if (!pendingReorder.value) {
    return [];
  }

  const ordered = [...props.variants];
  const sourceIndex = ordered.findIndex((variant) => variant.id === pendingReorder.value?.sourceId);
  const targetIndex = ordered.findIndex((variant) => variant.id === pendingReorder.value?.targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return [];
  }

  const [movedVariant] = ordered.splice(sourceIndex, 1);
  const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  ordered.splice(insertIndex, 0, movedVariant);

  return ordered.map((variant, index) => ({
    variantId: variant.id,
    sortOrder: index + 1,
  }));
};

const confirmReorder = async () => {
  const items = buildReorderItems();
  if (!items.length) {
    pendingReorder.value = null;
    return;
  }

  actionPending.value = "reorder";
  actionError.value = "";

  try {
    await productApi.reorderProductVariants(props.productId, { items });
    pendingReorder.value = null;
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to reorder the variants.");
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppConfirm
      :open="pendingReorder !== null"
      :title="pendingReorder ? `Move ${pendingReorder.sourceName}?` : ''"
      :detail="pendingReorder ? `Place this variant before ${pendingReorder.targetName}. The variant order will be updated after confirmation.` : ''"
      confirm-label="Save order"
      :loading="actionPending === 'reorder'"
      @confirm="confirmReorder"
      @cancel="pendingReorder = null"
    />
    <AppConfirm
      :open="blockedStatusVariant !== null"
      :title="blockedStatusVariant ? `Cannot deactivate ${blockedStatusVariant.name}` : ''"
      :detail="publishedVariantStatusMessage"
      cancel-label="Close"
      :hide-confirm="true"
      tone="warning"
      @cancel="blockedStatusVariantId = ''"
    />
    <AppConfirm
      :open="confirmVariant !== null"
      :title="confirmVariant ? `Remove ${confirmVariant.name}?` : ''"
      detail="This action removes the variant from the product."
      confirm-label="Remove"
      tone="danger"
      :loading="actionPending === 'remove'"
      @confirm="removeVariant"
      @cancel="confirmVariantId = ''"
    />
    <AppConfirm
      :open="actionErrorOpen"
      title="Variant action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <AppPanel eyebrow="Variants">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-smoke">
          {{ variants.length }} variants linked to this product.
        </p>
        <NuxtLink
          v-if="canUpdate"
          class="secondary-link"
          :to="`/products/${productId}/variants/create`"
        >
          Add variant
        </NuxtLink>
      </div>

      <AppNotice v-if="!canUpdate" tone="warning" title="Read-only access">
        You can review variants here, but product update permission is required to change them.
      </AppNotice>
      <AppNotice v-else-if="!canReorder && variants.length > 1" tone="warning" title="Reorder unavailable">
        Product reorder permission is required to drag and reorder variants.
      </AppNotice>

      <div v-if="variants.length" class="table-shell overflow-x-auto">
        <table class="data-table min-w-[1160px]">
          <thead>
            <tr>
              <th class="min-w-[120px] text-center">Image</th>
              <th class="min-w-[180px]">Variant</th>
              <th class="min-w-[120px]">Price</th>
              <th class="min-w-[110px]">Status</th>
              <th class="min-w-[72px] text-center">Sort</th>
              <th class="min-w-[120px] text-center">Default</th>
              <th class="w-[110px] text-center">Open</th>
              <th v-if="canUpdate" class="w-[120px] text-center">State</th>
              <th v-if="canUpdate" class="w-[100px] text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="variant in variants"
              :key="variant.id"
              :draggable="canDragVariants"
              :class="{
                'cursor-grab': canDragVariants,
                'opacity-55': dragSourceId === variant.id,
                'bg-moss/10': dragTargetId === variant.id,
              }"
              @dragstart="handleVariantDragStart(variant.id)"
              @dragend="resetDragState"
              @dragover.prevent="handleVariantDragOver(variant.id)"
              @drop.prevent="handleVariantDrop(variant.id)"
            >
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center justify-center">
                  <img
                    v-if="variant.img"
                    :src="variant.img"
                    :alt="`${variant.name} image`"
                    class="h-20 w-20 shrink-0 rounded-lg border border-line/60 object-cover"
                  >
                  <div
                    v-else
                    class="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-dashed border-line/70 bg-pearl text-xs font-medium text-smoke"
                  >
                    No image
                  </div>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center">
                  <p class="table-title">{{ variant.name }}</p>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center">
                  <p class="text-sm font-medium text-ink">{{ variant.price }}</p>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center">
                  <AppBadge :tone="variant.status === 'Active' ? 'success' : 'warning'">
                    {{ variant.status }}
                  </AppBadge>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center justify-center">
                  <span class="text-sm font-medium text-ink">{{ variant.sortOrder }}</span>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center justify-center">
                  <AppBadge v-if="variant.isDefault" tone="success">
                    Default
                  </AppBadge>
                  <AppButton
                    v-else-if="canUpdate"
                    class="table-action whitespace-nowrap"
                    variant="secondary"
                    :loading="actionPending === 'default' && actionTargetId === variant.id"
                    @click="setDefault(variant.id)"
                  >
                    Set default
                  </AppButton>
                  <span v-else class="text-sm text-smoke">Optional</span>
                </div>
              </td>
              <td class="align-middle">
                <div class="flex min-h-[72px] items-center justify-center">
                  <NuxtLink
                    class="secondary-link table-action whitespace-nowrap"
                    :to="`/products/${productId}/variants/${variant.id}`"
                  >
                    Open
                  </NuxtLink>
                </div>
              </td>
              <td v-if="canUpdate" class="align-middle">
                <div class="flex min-h-[72px] items-center justify-center">
                  <AppButton
                    class="table-action whitespace-nowrap"
                    variant="secondary"
                    :loading="actionPending === 'status' && actionTargetId === variant.id"
                    @click="updateStatus(variant.id)"
                  >
                    {{ variant.status === "Active" ? "Deactivate" : "Activate" }}
                  </AppButton>
                </div>
              </td>
              <td v-if="canUpdate" class="align-middle">
                <div class="flex min-h-[72px] items-center justify-center">
                  <AppButton
                    class="table-action whitespace-nowrap"
                    variant="danger"
                    @click="confirmVariantId = variant.id"
                  >
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
        title="No variants yet"
        detail="Create the first variant from this product to define pricing and purchase options."
      />
    </AppPanel>
  </div>
</template>
