<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProductVariantImagePage } from "~/features/products/composables/useProductVariantImagePage";

const props = defineProps<{
  page: ProductVariantImagePage;
}>();

const { productId, variant, pending, error, data, submitImage, selectedAsset, selectAsset, saveError, savePending } = props.page;

useScopedPageBreadcrumbs(() =>
  data.value?.product && variant.value
      ? [
          { label: "Products", to: "/products" },
          { label: data.value.product.name, to: `/products/${productId.value}` },
          { label: "Variants", to: `/products/${productId.value}?tab=variants` },
          { label: variant.value.name, to: `/products/${productId.value}/variants/${variant.value.id}` },
          { label: "Manage image" },
        ]
    : [],
);
</script>

<template>
  <div class="page-shell">
    <section v-if="pending" class="max-w-6xl">
      <div class="soft-card h-[420px] animate-pulse" />
    </section>

    <AppNotice v-else-if="error" tone="danger" title="Unable to load variant image editor">
      {{ getProblemMessage(error, "The variant image editor could not be loaded.") }}
    </AppNotice>

    <AppNotice v-else-if="!variant" tone="danger" title="Variant not found">
      The selected variant does not exist for this product.
    </AppNotice>

    <section v-else class="max-w-6xl">
      <AppPanel eyebrow="Manage image">
        <form class="grid gap-6" @submit.prevent="submitImage">
          <AppNotice v-if="!(data?.assets.assets?.length ?? 0)" tone="warning" title="No product assets">
            Upload product assets from the Assets tab before assigning an image to this variant.
            <NuxtLink class="secondary-link ml-2" :to="`/products/${productId}?tab=assets`">
              Open assets
            </NuxtLink>
          </AppNotice>

          <ProductAssetPickerPanel
            v-else
            :assets="data?.assets.assets ?? []"
            :selected-asset-id="selectedAsset?.id || ''"
            :preview-img="variant.img"
            preview-fallback="None"
            preview-selected-text="Variant image preview"
            preview-empty-text="Select an asset below"
            :library-subject="data?.product.name ?? productId"
            :asset-alt="variant.name"
            @select="selectAsset"
          />

          <AppNotice v-if="saveError" tone="danger" title="Variant image update failed">
            {{ saveError }}
          </AppNotice>

          <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
            <AppButton :loading="savePending" type="submit">Save image</AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
