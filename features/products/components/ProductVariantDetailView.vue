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

const selectVariantTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};
</script>

<template>
  <AppDetailPage
    :title="variant?.name ?? ''"
    :tabs="variantTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The variant detail could not be loaded.') : null"
    error-title="Unable to load variant"
    @select-tab="selectVariantTab"
  >
    <AppNotice v-if="!variant" tone="danger" title="Variant not found">
      The selected variant does not exist for this product.
    </AppNotice>

    <template v-else>
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
    </template>
  </AppDetailPage>
</template>
