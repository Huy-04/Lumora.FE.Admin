<script setup lang="ts">
import type { ProductDetailPage } from "~/features/products/composables/useProductDetailPage";

const props = defineProps<{
  page: ProductDetailPage;
}>();

const { error, pending, data, categoryLabel, productSectionWarnings, productTabs, activeTab, selectTab, canRestoreProduct, productId, canManageProductContent, canReorderProduct, canReadCategories, canPublishProduct, canDiscontinueProduct, categoryOptions, refresh } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load product">
      {{ getProblemMessage(error, "The product detail could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data?.product" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Admin</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/products">Products</NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">{{ data.product.name }}</h1>
            <p class="detail-copy">
              {{ data.product.slug }}
              <span> / {{ categoryLabel }}</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <AppBadge v-if="data.product.isDeleted" tone="danger">
              Deleted
            </AppBadge>
            <AppBadge :tone="data.product.status === 'Published' ? 'success' : data.product.status === 'Discontinued' ? 'warning' : 'default'">
              {{ data.product.status }}
            </AppBadge>
            <AppBadge :tone="data.product.isFeatured ? 'success' : 'default'">
              {{ data.product.isFeatured ? "Featured" : "Standard" }}
            </AppBadge>
            <AppBadge>{{ data.product.genderTarget }}</AppBadge>
            <AppBadge>Order {{ data.product.sortOrder }}</AppBadge>
          </div>
        </div>

        <AppNotice
          v-if="productSectionWarnings.length"
          tone="warning"
          title="Some product sections could not be loaded"
        >
          {{ `Unavailable sections: ${productSectionWarnings.join(", ")}.` }}
        </AppNotice>

        <div class="detail-tabs">
          <button
            v-for="tab in productTabs"
            :key="tab.value"
            type="button"
            class="detail-tab"
            :class="{ 'detail-tab-active': activeTab === tab.value }"
            @click="selectTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </section>

      <section v-if="pending" class="detail-stack">
        <div class="soft-card h-72 animate-pulse" />
        <div class="soft-card h-48 animate-pulse" />
      </section>

      <section v-else-if="data?.product" class="detail-stack">
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
          :can-publish="canPublishProduct"
          :can-discontinue="canDiscontinueProduct"
          @refresh="refresh"
        />
      </section>
    </template>
  </div>
</template>
