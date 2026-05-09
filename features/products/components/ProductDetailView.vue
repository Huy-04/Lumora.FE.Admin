<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProductDetailPage } from "~/features/products/composables/useProductDetailPage";

const props = defineProps<{
  page: ProductDetailPage;
}>();

const { error, pending, data, categoryLabel, productSectionWarnings, productTabs, activeTab, selectTab, canRestoreProduct, productId, canManageProductContent, canReorderProduct, canReadCategories, categoryOptions, refresh } = props.page;

const selectProductTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  productTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() =>
  data.value?.product
    ? [
        { label: "Products", to: "/products" },
        { label: data.value.product.name, to: `/products/${productId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="data?.product?.name ?? ''"
    :tabs="productTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The product detail could not be loaded.') : null"
    error-title="Unable to load product"
    @select-tab="selectProductTab"
  >
    <template v-if="data?.product">
      <AppNotice
        v-if="productSectionWarnings.length"
        tone="warning"
        title="Some product sections could not be loaded"
      >
        {{ `Unavailable sections: ${productSectionWarnings.join(", ")}.` }}
      </AppNotice>

      <ProductOverviewTab
        v-if="activeTab === 'overview'"
        :product="data.product"
        :category-label="categoryLabel"
        :variants="data.variants"
        :gallery="data.gallery"
        :attributes="data.attributes"
        :can-restore="canRestoreProduct"
        @refresh="refresh"
      />
      <ProductVariantsTab
        v-else-if="activeTab === 'variants'"
        :product-id="productId"
        :product-status="data.product.status"
        :variants="data.variants"
        :can-update="canManageProductContent"
        :can-reorder="canReorderProduct"
        @refresh="refresh"
      />
      <ProductAssetsTab
        v-else-if="activeTab === 'assets'"
        :product-id="productId"
        :assets="data.assets?.assets ?? []"
        :can-update="canManageProductContent"
        @refresh="refresh"
      />
      <ProductGalleryTab
        v-else-if="activeTab === 'gallery'"
        :product-id="productId"
        :product-status="data.product.status"
        :gallery="data.gallery"
        :can-update="canManageProductContent"
        :can-reorder="canReorderProduct"
        @refresh="refresh"
      />
      <ProductAttributesTab
        v-else-if="activeTab === 'attributes'"
        :product-id="productId"
        :attributes="data.attributes"
        :can-update="canManageProductContent"
        @refresh="refresh"
      />
      <ProductEditTab
        v-else
        :product="data.product"
        :category-options="categoryOptions"
        :can-read-categories="canReadCategories"
        @refresh="refresh"
      />
    </template>
  </AppDetailPage>
</template>
