<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProductGalleryCreatePage } from "~/features/products/composables/useProductGalleryCreatePage";

const props = defineProps<{
  page: ProductGalleryCreatePage;
}>();

const { productError, productPending, product, productId, assets, canUpdateProduct, form, errorMessage, pending, canCreateImage, selectAsset, submit } = props.page;

useScopedPageBreadcrumbs(() =>
  product.value?.product
      ? [
          { label: "Products", to: "/products" },
          { label: product.value.product.name, to: `/products/${productId.value}` },
          { label: "Gallery", to: `/products/${productId.value}?tab=gallery` },
          { label: "Add image" },
        ]
    : [],
);
</script>

<template>
  <div class="page-shell">
    <section class="max-w-6xl">
      <AppNotice v-if="productError" tone="danger" title="Unable to load product">
        {{ getProblemMessage(productError, "The parent product could not be loaded.") }}
      </AppNotice>

      <AppPanel
        v-else
        eyebrow="Add image"
      >
        <template v-if="productPending">
          <div class="grid gap-4">
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
          </div>
        </template>

        <form v-else class="form-stack" @submit.prevent="submit">
          <AppNotice v-if="!canUpdateProduct" tone="warning" title="Read-only access">
            Product update permission is required to add gallery images.
          </AppNotice>

          <AppNotice v-else-if="product?.product.isDeleted" tone="warning" title="Image creation unavailable">
            Restore this product before adding new gallery images.
          </AppNotice>

          <AppNotice v-if="!assets.length" tone="warning" title="No product assets">
            Upload at least one asset from the Assets tab before adding gallery images.
            <NuxtLink class="secondary-link ml-2" :to="`/products/${productId}?tab=assets`">
              Open assets
            </NuxtLink>
          </AppNotice>

          <div v-if="assets.length" class="grid gap-5">
            <ProductAssetPickerPanel
              :assets="assets"
              :selected-asset-id="form.assetId"
              preview-fallback="None"
              preview-selected-text="Gallery image preview"
              preview-empty-text="Select an asset below"
              :library-subject="product?.product.name ?? productId"
              asset-alt="Product asset"
              @select="selectAsset"
            />
          </div>

          <div v-else class="grid gap-4">
            <div class="border-y border-line/70 py-4">
              <div class="grid gap-1">
                <p class="meta-label">Product</p>
                <p class="table-title">{{ product?.product.name ?? productId }}</p>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.alt" label="Alt text" placeholder="Short storefront description" />
          </div>

          <AppNotice v-if="errorMessage" tone="danger" title="Create image failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
            <AppButton :loading="pending" type="submit" :disabled="!canCreateImage">
              Create image
            </AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
