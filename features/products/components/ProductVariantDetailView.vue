<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
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
  openInventory,
  selectTab,
  refresh,
} = props.page;

const selectVariantTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  variantTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

const inventoryActionErrorOpen = computed(() => inventoryActionError.value.length > 0);

const closeInventoryActionError = () => {
  inventoryActionError.value = "";
};

useScopedPageBreadcrumbs(() => {
  const productName = data.value?.product?.name ?? "";

  return variant.value && productName
      ? [
          { label: "Products", to: "/products" },
          { label: productName, to: `/products/${productId.value}` },
          { label: "Variants", to: `/products/${productId.value}?tab=variants` },
          { label: variant.value.name, to: `/products/${productId.value}/variants/${variantId.value}` },
          { label: activeTabLabel.value },
        ]
    : [];
});
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
    <template #modals>
      <AppConfirm
        :open="inventoryActionErrorOpen"
        title="Inventory action failed"
        :detail="inventoryActionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeInventoryActionError"
      />
    </template>

    <AppNotice v-if="!variant" tone="danger" title="Variant not found">
      The selected variant does not exist for this product.
    </AppNotice>

    <template v-else>
      <ProductVariantOverviewTab
        v-if="activeTab === 'overview'"
        :variant="variant"
      />
      <ProductVariantEditTab
        v-else-if="activeTab === 'edit'"
        :product-id="productId"
        :variant="variant"
        :assets="data?.assets.assets ?? []"
        @refresh="refresh"
      />
      <AppPanel
        v-else-if="activeTab === 'inventory'"
        eyebrow="Inventory"
      >
        <div class="grid gap-4">
          <div class="grid gap-3 border-y border-line/70 py-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
            <p class="meta-label">Variant</p>
            <div class="min-w-0">
              <p class="table-title">{{ variant.sku }}</p>
              <p class="mt-1 break-all text-sm text-smoke">{{ variantId }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-3">
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

      </AppPanel>
    </template>
  </AppDetailPage>
</template>
