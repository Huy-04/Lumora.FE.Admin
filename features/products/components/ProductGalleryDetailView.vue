<script setup lang="ts">
import type { ProductGalleryDetailPage } from "~/features/products/composables/useProductGalleryDetailPage";

const props = defineProps<{
  page: ProductGalleryDetailPage;
}>();

const { error, pending, productId, image, galleryTabs, activeTab, selectTab, refresh } = props.page;

const selectGalleryTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};
</script>

<template>
  <AppDetailPage
    :title="image ? 'Gallery image' : ''"
    :tabs="image ? galleryTabs : []"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The gallery image detail could not be loaded.') : null"
    error-title="Unable to load image"
    @select-tab="selectGalleryTab"
  >
    <AppNotice v-if="!image" tone="danger" title="Image not found">
      The selected gallery image does not exist for this product.
    </AppNotice>

    <template v-else>
      <ProductGalleryOverviewTab
        v-if="activeTab === 'overview'"
        :image="image"
      />
      <ProductGalleryEditTab
        v-else
        :product-id="productId"
        :image="image"
        @refresh="refresh"
      />
    </template>
  </AppDetailPage>
</template>
