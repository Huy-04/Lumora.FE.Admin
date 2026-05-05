<script setup lang="ts">
import type { ProductGalleryDetailPage } from "~/features/products/composables/useProductGalleryDetailPage";

const props = defineProps<{
  page: ProductGalleryDetailPage;
}>();

const { error, pending, data, productId, imageId, image, galleryTabs, activeTab, selectTab, refresh } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load image">
      {{ getProblemMessage(error, "The gallery image detail could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data?.product && image" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Admin</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/products">Products</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" :to="`/products/${productId}?tab=gallery`">
            {{ data.product.name }}
          </NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">Gallery image</h1>
            <p class="detail-copy">
              {{ image.alt || "No alt text yet" }} / image of {{ data.product.name }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <AppBadge :tone="image.isPrimary ? 'success' : 'default'">
              {{ image.isPrimary ? "Primary storefront image" : "Secondary gallery image" }}
            </AppBadge>
            <AppBadge>Order {{ image.sortOrder }}</AppBadge>
          </div>
        </div>

        <div class="detail-tabs">
          <button
            v-for="tab in galleryTabs"
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

      <AppNotice v-else-if="!image" tone="danger" title="Image not found">
        The selected gallery image does not exist for this product.
      </AppNotice>

      <section v-else class="detail-stack">
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
      </section>
    </template>
  </div>
</template>
