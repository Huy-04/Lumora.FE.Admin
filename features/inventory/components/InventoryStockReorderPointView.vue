<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { InventoryStockCreatePage } from "~/features/inventory/composables/useInventoryStockCreatePage";

const props = defineProps<{
  page: InventoryStockCreatePage;
}>();

const {
  canAddStock,
  canReadWarehouses,
  canUpdateInventory,
  form,
  inventory,
  inventoryError,
  inventoryId,
  inventoryPending,
  selectedStock,
  reorderPointErrorMessage,
  reorderPointPending,
  setReorderPoint,
  warehouseOptions,
} = props.page;

const warehouseLabel = computed(() =>
  warehouseOptions.value.find((warehouse) => warehouse.value === form.warehouseId)?.label
  ?? form.warehouseId,
);

useScopedPageBreadcrumbs(() =>
  inventory.value
    ? [
        { label: "Inventories", to: "/inventory" },
        { label: inventory.value.sku, to: `/inventory/${inventoryId.value}?tab=operations` },
        { label: "Reorder point" },
      ]
    : [],
);
</script>

<template>
  <div class="page-shell">
    <section class="max-w-6xl">
      <AppNotice v-if="inventoryError" tone="danger" title="Unable to load inventory">
        {{ getProblemMessage(inventoryError, "The inventory record could not be loaded.") }}
      </AppNotice>

      <AppPanel v-else eyebrow="Reorder point">
        <template v-if="inventoryPending">
          <div class="grid gap-4">
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
          </div>
        </template>

        <form v-else class="form-stack" @submit.prevent="setReorderPoint">
          <AppNotice v-if="!canUpdateInventory" tone="warning" title="Read-only access">
            Inventory update permission is required to set a reorder point.
          </AppNotice>

          <AppNotice v-else-if="!canReadWarehouses" tone="warning" title="Warehouse access required">
            Warehouse read permission is required to load this stock row.
          </AppNotice>

          <AppNotice v-else-if="!selectedStock" tone="warning" title="Stock row unavailable">
            This warehouse is not attached to the selected inventory.
          </AppNotice>

          <div class="border-y border-line/70 py-4">
            <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span class="meta-label w-40 shrink-0">Inventory</span>
              <span class="text-sm font-medium text-ink">{{ inventory?.sku ?? inventoryId }}</span>
            </div>
          </div>

          <div class="border-b border-line/70 pb-4">
            <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span class="meta-label w-40 shrink-0">Warehouse</span>
              <span class="text-sm font-medium text-ink">{{ warehouseLabel }}</span>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput
              :model-value="selectedStock?.reorderPoint == null ? 'None' : String(selectedStock.reorderPoint)"
              label="Current reorder point"
              readonly
            />
            <AppInput
              v-model="form.reorderPoint"
              label="New reorder point"
              inputmode="numeric"
              placeholder="5"
            />
          </div>

          <AppNotice v-if="reorderPointErrorMessage" tone="danger" title="Set reorder point failed">
            {{ reorderPointErrorMessage }}
          </AppNotice>

          <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
            <NuxtLink class="secondary-link" :to="`/inventory/${inventoryId}?tab=operations`">
              Cancel
            </NuxtLink>
            <AppButton
              :loading="reorderPointPending"
              type="submit"
              :disabled="!canAddStock || !form.warehouseId || !selectedStock"
            >
              Set reorder point
            </AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
