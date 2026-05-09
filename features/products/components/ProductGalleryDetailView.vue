<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProductGalleryDetailPage } from "~/features/products/composables/useProductGalleryDetailPage";

const props = defineProps<{
  page: ProductGalleryDetailPage;
}>();

const { error, pending, productId, imageId, image, assets, galleryTabs, activeTab, selectTab, refresh } = props.page;

const selectGalleryTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  galleryTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() => {
  const productName = props.page.data.value?.product?.name ?? "";

  return image.value && productName
      ? [
          { label: "Products", to: "/products" },
          { label: productName, to: `/products/${productId.value}` },
          { label: "Gallery", to: `/products/${productId.value}?tab=gallery` },
          { label: "Gallery image", to: `/products/${productId.value}/gallery/${imageId.value}` },
          { label: activeTabLabel.value },
        ]
    : [];
});
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
        :assets="assets"
        @refresh="refresh"
      />
    </template>
  </AppDetailPage>
</template>
