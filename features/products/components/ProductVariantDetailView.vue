<script setup lang="ts">
import type { ProductVariantDetailPage } from "~/features/products/composables/useProductVariantDetailPage";

const props = defineProps<{
  page: ProductVariantDetailPage;
}>();

const {
  error,
  pending,
  data,
  productId,
  variantId,
  variant,
  variantTabs,
  activeTab,
  canCreateInventory,
  canReadInventory,
  createInventory,
  inventoryActionError,
  inventoryActionPending,
  inventoryActionSuccess,
  openInventory,
  selectTab,
  refresh,
} = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load variant">
      {{ getProblemMessage(error, "The variant detail could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data?.product && variant" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Admin</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/products">Products</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" :to="`/products/${productId}?tab=variants`">
            {{ data.product.name }}
          </NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">{{ variant.name }}</h1>
            <p class="detail-copy">
              {{ variant.sku }}
              <span> / variant of {{ data.product.name }}</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <AppBadge :tone="variant.status === 'Active' ? 'success' : 'warning'">
              {{ variant.status }}
            </AppBadge>
            <AppBadge :tone="variant.isDefault ? 'success' : 'default'">
              {{ variant.isDefault ? "Default" : "Optional" }}
            </AppBadge>
            <AppBadge>Order {{ variant.sortOrder }}</AppBadge>
          </div>
        </div>

        <div class="detail-tabs">
          <button
            v-for="tab in variantTabs"
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

      <AppNotice v-else-if="!variant" tone="danger" title="Variant not found">
        The selected variant does not exist for this product.
      </AppNotice>

      <section v-else class="detail-stack">
        <AppPanel
          v-if="canReadInventory || canCreateInventory"
          title="Inventory"
          description="Open or create the inventory record attached to this product variant."
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm font-medium text-ink">{{ variant.sku }}</p>
              <p class="text-sm text-smoke">{{ variantId }}</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <AppButton
                v-if="canReadInventory"
                variant="secondary"
                :loading="inventoryActionPending === 'open'"
                @click="openInventory"
              >
                Open inventory
              </AppButton>
              <AppButton
                v-if="canCreateInventory"
                :loading="inventoryActionPending === 'create'"
                @click="createInventory"
              >
                Create inventory
              </AppButton>
            </div>
          </div>
          <AppNotice v-if="inventoryActionSuccess" class="mt-4" tone="success" title="Inventory ready">
            {{ inventoryActionSuccess }}
          </AppNotice>
          <AppNotice v-if="inventoryActionError" class="mt-4" tone="danger" title="Inventory action failed">
            {{ inventoryActionError }}
          </AppNotice>
        </AppPanel>

        <ProductVariantOverviewTab
          v-if="activeTab === 'overview'"
          :variant="variant"
        />
        <ProductVariantEditTab
          v-else
          :product-id="productId"
          :variant="variant"
          :assets="data?.assets.assets ?? []"
          @refresh="refresh"
        />
      </section>
    </template>
  </div>
</template>
