<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { InventoryStockCreatePage } from "~/features/inventory/composables/useInventoryStockCreatePage";

const props = defineProps<{
  page: InventoryStockCreatePage;
}>();

const {
  canAddStock,
  canUpdateSelectedWarehouse,
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
  warehouseCatalogWarning,
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
    <section class="grid max-w-6xl gap-6">
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

          <AppNotice v-else-if="form.warehouseId && !canUpdateSelectedWarehouse" tone="warning" title="Warehouse access required">
            Inventory update permission for this warehouse is required.
          </AppNotice>

          <AppNotice v-else-if="warehouseCatalogWarning" tone="warning" title="Warehouse catalog unavailable">
            {{ warehouseCatalogWarning }}
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
            <div class="grid gap-2">
              <span class="app-label">New reorder point</span>
              <div class="grid grid-cols-[1fr_auto] gap-3">
                <AppInput
                  v-model="form.reorderPoint"
                  label=""
                  inputmode="numeric"
                  placeholder="5"
                />
                <button
                  type="button"
                  class="inline-flex h-[2.75rem] items-center justify-center rounded-[10px] border border-line bg-surface px-3 text-sm text-smoke transition duration-200 ease-out hover:text-ink"
                  title="Clear reorder point (set to none)"
                  @click="form.reorderPoint = ''"
                >
                  Clear
                </button>
              </div>
              <p class="text-xs text-smoke">
                Leave empty or press Clear to remove the reorder point threshold.
              </p>
            </div>
          </div>

          <div v-if="selectedStock" class="rounded-lg border border-line/50 bg-surface-alt/30 p-4">
            <h4 class="mb-2 text-sm font-medium text-ink">Alert status explanation</h4>
            <ul class="grid gap-1.5 text-xs text-smoke">
              <li>
                <span class="inline-block w-20 rounded bg-emerald-500/15 px-1.5 py-0.5 text-center text-emerald-400">InStock</span>
                — availableQuantity is above the reorder point
              </li>
              <li>
                <span class="inline-block w-20 rounded bg-amber-500/15 px-1.5 py-0.5 text-center text-amber-400">LowStock</span>
                — availableQuantity ≤ reorder point (and &gt; 0)
              </li>
              <li>
                <span class="inline-block w-20 rounded bg-red-500/15 px-1.5 py-0.5 text-center text-red-400">OutOfStock</span>
                — availableQuantity = 0
              </li>
            </ul>
            <p v-if="selectedStock.alertStatus" class="mt-2 text-xs text-smoke">
              Current alert status:
              <span
                class="font-medium"
                :class="{
                  'text-emerald-400': selectedStock.alertStatus === 'InStock',
                  'text-amber-400': selectedStock.alertStatus === 'LowStock',
                  'text-red-400': selectedStock.alertStatus === 'OutOfStock',
                }"
              >
                {{ selectedStock.alertStatus }}
              </span>
              <template v-if="selectedStock.alertStatus !== 'OutOfStock'">
                (available: {{ selectedStock.availableQuantity }}<template v-if="selectedStock.reorderPoint != null">, reorder point: {{ selectedStock.reorderPoint }}</template>)
              </template>
              <template v-else>
                (available: 0)
              </template>
            </p>
          </div>

          <AppNotice v-if="reorderPointErrorMessage" tone="danger" title="Set reorder point failed">
            {{ reorderPointErrorMessage }}
          </AppNotice>

          <div class="flex flex-wrap items-center justify-end gap-4 border-t border-line/70 pt-4">
            <NuxtLink class="secondary-link min-w-[9rem]" :to="`/inventory/${inventoryId}?tab=operations`">
              Cancel
            </NuxtLink>
            <AppButton
              :loading="reorderPointPending"
              type="submit"
              class="min-w-[12rem]"
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
