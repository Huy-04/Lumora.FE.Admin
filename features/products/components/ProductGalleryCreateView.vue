<script setup lang="ts">
import type { ProductGalleryCreatePage } from "~/features/products/composables/useProductGalleryCreatePage";

const props = defineProps<{
  page: ProductGalleryCreatePage;
}>();

const { productError, productPending, product, productId, assets, totalPages, pagedAssets, pageSummary, selectedAsset, currentPage, canUpdateProduct, form, errorMessage, pending, canCreateImage, selectAsset, isAssetSelected, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppNotice v-if="productError" tone="danger" title="Unable to load product">
        {{ getProblemMessage(productError, "The parent product could not be loaded.") }}
      </AppNotice>

      <AppPanel
        v-else
        eyebrow="Add image"
        title="Add image"
        :description="product?.product
          ? `Attach a gallery image to ${product.product.name} by selecting from this product's asset library. Image order can be rearranged later from the gallery tab.`
          : 'Attach a new gallery image to this product.'"
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

          <AppInput :model-value="product?.product.name ?? productId" label="Product" readonly />

          <AppNotice v-if="!assets.length" tone="warning" title="No product assets">
            Upload at least one asset from the Assets tab before adding gallery images.
            <NuxtLink class="secondary-link ml-2" :to="`/products/${productId}?tab=assets`">
              Open assets
            </NuxtLink>
          </AppNotice>

          <div class="grid gap-6">
            <div class="grid gap-4 rounded-[24px] border border-line/70 bg-surface px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
              <div class="h-24 w-24 overflow-hidden rounded-[20px] border border-line bg-pearl">
                <img
                  v-if="selectedAsset"
                  :src="selectedAsset.img"
                  alt="Selected product asset"
                  class="h-full w-full object-cover"
                >
                <div v-else class="grid h-full w-full place-items-center text-xs font-medium text-smoke">
                  No asset
                </div>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-ink">
                  {{ selectedAsset ? "Asset selected" : "No asset selected" }}
                </p>
                <p class="mt-1 text-sm leading-6 text-smoke">
                  {{ selectedAsset ? "Choose another asset below, or create the gallery image with this selection." : "Select one product asset below to add it to the gallery." }}
                </p>
                <p v-if="selectedAsset" class="mt-2 break-all text-xs text-smoke">
                  {{ selectedAsset.storagePath }}
                </p>
              </div>
            </div>

            <div v-if="assets.length" class="grid gap-4">
              <div class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-line/70 bg-surface px-4 py-3 text-sm text-smoke">
                <p>{{ pageSummary }}</p>
                <div v-if="totalPages > 1" class="flex items-center gap-3">
                  <AppButton
                    type="button"
                    variant="ghost"
                    :disabled="currentPage <= 1"
                    @click="currentPage -= 1"
                  >
                    Previous
                  </AppButton>
                  <span>Page {{ currentPage }} / {{ totalPages }}</span>
                  <AppButton
                    type="button"
                    variant="ghost"
                    :disabled="currentPage >= totalPages"
                    @click="currentPage += 1"
                  >
                    Next
                  </AppButton>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                <button
                  v-for="asset in pagedAssets"
                  :key="asset.id"
                  type="button"
                  class="tactile overflow-hidden rounded-[28px] border p-2 text-left transition duration-300 ease-out"
                  :class="isAssetSelected(asset)
                    ? 'border-ink bg-panel shadow-[0_18px_35px_-24px_rgba(15,23,42,0.24)] dark:bg-panel/80'
                    : 'border-line bg-surface hover:border-ink/35 hover:bg-panel/70 dark:bg-surface/80'"
                  @click="selectAsset(asset)"
                >
                  <div class="aspect-square overflow-hidden rounded-[24px] border border-line bg-pearl">
                    <img :src="asset.img" alt="Product asset" class="h-full w-full object-cover">
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.alt" label="Alt text" placeholder="Short storefront description" />
          </div>

          <AppNotice v-if="errorMessage" tone="danger" title="Create image failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit" :disabled="!canCreateImage">
              Create image
            </AppButton>
            <NuxtLink class="secondary-link" :to="`/products/${productId}?tab=gallery`">
              Back to gallery
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
