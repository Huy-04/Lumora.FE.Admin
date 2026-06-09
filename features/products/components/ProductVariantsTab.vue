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
const {
  actionError,
  actionErrorOpen,
  actionPending,
  actionTargetId,
  blockedStatusVariant,
  blockedStatusVariantId,
  canDragVariants,
  closeActionError,
  confirmReorder,
  confirmVariant,
  confirmVariantId,
  dragSourceId,
  dragTargetId,
  handleVariantDragOver,
  handleVariantDragStart,
  handleVariantDrop,
  inactiveDefaultVariantMessage,
  isSetDefaultBlocked,
  pendingReorder,
  publishedVariantStatusMessage,
  removeVariant,
  resetDragState,
  setDefault,
  updateStatus,
} = useProductVariantsTab(props, () => emit("refresh"));
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
                    :disabled="isSetDefaultBlocked(variant)"
                    :loading="actionPending === 'default' && actionTargetId === variant.id"
                    :title="isSetDefaultBlocked(variant) ? inactiveDefaultVariantMessage : undefined"
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
