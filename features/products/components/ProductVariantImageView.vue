<script setup lang="ts">
import type { ProductVariantImagePage } from "~/features/products/composables/useProductVariantImagePage";

const props = defineProps<{
  page: ProductVariantImagePage;
}>();

const { productId, variantId, variant, pending, error, data, submitImage, selectedAsset, variantInitial, pageSummary, totalPages, currentPage, pagedAssets, isAssetSelected, selectAsset, removeImage, resetDraft, saveSuccess, saveError, savePending } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="detail-header">
      <div class="detail-crumbs">
        <NuxtLink class="detail-crumb-link" to="/">Admin</NuxtLink>
        <span>/</span>
        <NuxtLink class="detail-crumb-link" to="/products">Products</NuxtLink>
        <span>/</span>
        <NuxtLink class="detail-crumb-link" :to="`/products/${productId}/variants/${variantId}?tab=edit`">
          {{ variant?.name || "Variant" }}
        </NuxtLink>
      </div>
      <h1 class="detail-title">Manage image</h1>
      <p class="detail-copy">
        Pick one image from the uploaded product assets for this variant.
      </p>
    </section>

    <section v-if="pending" class="grid gap-6">
      <div class="soft-card h-[420px] animate-pulse" />
    </section>

    <AppNotice v-else-if="error" tone="danger" title="Unable to load variant image editor">
      {{ getProblemMessage(error, "The variant image editor could not be loaded.") }}
    </AppNotice>

    <AppNotice v-else-if="!variant" tone="danger" title="Variant not found">
      The selected variant does not exist for this product.
    </AppNotice>

    <section v-else class="grid gap-6">
      <AppPanel title="Variant image" :description="variant ? `Selected image for ${variant.name}.` : 'Selected image for this variant.'">
        <form class="grid gap-6" @submit.prevent="submitImage">
          <div class="grid gap-4 rounded-[24px] border border-line/70 bg-surface px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
            <div class="h-24 w-24 overflow-hidden rounded-[20px] border border-line bg-pearl">
              <img
                v-if="selectedAsset?.img"
                :src="selectedAsset.img"
                :alt="variant.name"
                class="h-full w-full object-cover"
              >
              <div v-else class="grid h-full w-full place-items-center text-lg font-semibold text-smoke">
                {{ variantInitial }}
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">
                {{ selectedAsset ? "Image selected" : "No image selected" }}
              </p>
              <p class="mt-1 text-sm leading-6 text-smoke">
                {{ selectedAsset ? "Choose another asset below, or remove the current one." : "Select one asset below to use as the variant image." }}
              </p>
            </div>
          </div>

          <AppNotice v-if="!(data?.assets.assets?.length ?? 0)" tone="warning" title="No product assets">
            Upload product assets from the Assets tab before assigning an image to this variant.
            <NuxtLink class="secondary-link ml-2" :to="`/products/${productId}?tab=assets`">
              Open assets
            </NuxtLink>
          </AppNotice>

          <div v-else class="grid gap-4">
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
                  <img :src="asset.img" :alt="variant.name" class="h-full w-full object-cover">
                </div>
              </button>
            </div>
          </div>

          <div class="rounded-[28px] border border-line/70 bg-surface px-4 py-4 dark:bg-surface/80">
            <div class="flex flex-wrap gap-3">
              <AppButton v-if="selectedAsset" type="button" variant="ghost" @click="removeImage">
                Remove image
              </AppButton>
              <button
                type="button"
                class="secondary-link"
                @click="resetDraft"
              >
                Reset changes
              </button>
            </div>
          </div>

          <AppNotice v-if="saveSuccess" tone="success" title="Variant image updated">
            {{ saveSuccess }}
          </AppNotice>

          <AppNotice v-if="saveError" tone="danger" title="Variant image update failed">
            {{ saveError }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="savePending" type="submit">Save image</AppButton>
            <NuxtLink class="secondary-link" :to="`/products/${productId}/variants/${variantId}?tab=edit`">
              Back to variant
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
