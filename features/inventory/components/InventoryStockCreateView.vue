<script setup lang="ts">
import { PhMinus, PhPlus } from "@phosphor-icons/vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { InventoryStockCreatePage } from "~/features/inventory/composables/useInventoryStockCreatePage";

const props = defineProps<{
  page: InventoryStockCreatePage;
}>();

const {
  canAddStock,
  canUpdateSelectedWarehouse,
  canUseWarehouseCatalog,
  canUpdateInventory,
  errorMessage,
  form,
  inventory,
  inventoryError,
  inventoryId,
  inventoryPending,
  isExistingStockMode,
  pending,
  selectedWarehouseActive,
  submit,
  warehouseCatalogWarning,
  warehouseOptions,
} = props.page;

useScopedPageBreadcrumbs(() =>
  inventory.value
    ? [
        { label: "Inventories", to: "/inventory" },
        { label: inventory.value.sku, to: `/inventory/${inventoryId.value}?tab=operations` },
        { label: isExistingStockMode.value ? "Adjust stock" : "Add warehouse stock" },
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

      <AppPanel
        v-else
        :eyebrow="isExistingStockMode ? 'Adjust stock' : 'Add warehouse stock'"
      >
        <template v-if="inventoryPending">
          <div class="grid gap-4">
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
          </div>
        </template>

        <form v-else class="form-stack" @submit.prevent="submit">
          <AppNotice v-if="!canUpdateInventory" tone="warning" title="Read-only access">
            Inventory update permission is required to {{ isExistingStockMode ? "adjust stock" : "add stock" }}.
          </AppNotice>

          <AppNotice v-else-if="form.warehouseId && !canUpdateSelectedWarehouse" tone="warning" title="Warehouse access required">
            Inventory update permission for this warehouse is required.
          </AppNotice>

          <AppNotice v-else-if="warehouseCatalogWarning" tone="warning" title="Warehouse catalog unavailable">
            {{ warehouseCatalogWarning }}
          </AppNotice>

          <AppNotice v-else-if="canUseWarehouseCatalog && !warehouseOptions.length" tone="warning" title="No warehouses available">
            Every available warehouse already has a stock row for this inventory.
          </AppNotice>

          <AppNotice v-else-if="form.warehouseId && !selectedWarehouseActive" tone="warning" title="Warehouse inactive">
            Stock correction is allowed, but this warehouse will not be operational until it is activated.
          </AppNotice>

          <div class="border-y border-line/70 py-4">
            <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span class="meta-label w-40 shrink-0">Inventory</span>
              <span class="text-sm font-medium text-ink">{{ inventory?.sku ?? inventoryId }}</span>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect
              v-if="canUseWarehouseCatalog"
              v-model="form.warehouseId"
              label="Warehouse"
              placeholder="Select warehouse"
              :disabled="isExistingStockMode || !warehouseOptions.length"
              :options="warehouseOptions"
            />
            <AppInput
              v-else
              v-model="form.warehouseId"
              label="Warehouse ID"
              placeholder="Enter warehouse ID"
              :readonly="isExistingStockMode"
            />
            <div v-if="isExistingStockMode" class="grid gap-2">
              <span class="app-label">Quantity</span>
              <div class="grid grid-cols-[1fr_auto] gap-3">
                <AppInput
                  v-model="form.quantity"
                  label=""
                  inputmode="numeric"
                  placeholder="10"
                />
                <div class="grid grid-cols-2 self-start overflow-hidden rounded-[10px] border border-line bg-surface">
                  <button
                    type="button"
                    class="inline-flex h-[2.75rem] w-[2.75rem] items-center justify-center border-r border-line text-smoke transition duration-200 ease-out hover:text-ink"
                    :class="form.adjustmentDirection === 'increase' ? 'bg-emerald-500/15 text-emerald-300' : ''"
                    aria-label="Increase stock"
                    title="Increase stock"
                    @click="form.adjustmentDirection = 'increase'"
                  >
                    <PhPlus :size="22" weight="bold" />
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-[2.75rem] w-[2.75rem] items-center justify-center text-smoke transition duration-200 ease-out hover:text-ink"
                    :class="form.adjustmentDirection === 'decrease' ? 'bg-red-500/15 text-red-300' : ''"
                    aria-label="Decrease stock"
                    title="Decrease stock"
                    @click="form.adjustmentDirection = 'decrease'"
                  >
                    <PhMinus :size="22" weight="bold" />
                  </button>
                </div>
              </div>
            </div>
            <AppInput
              v-else
              v-model="form.quantity"
              label="Quantity"
              inputmode="numeric"
              placeholder="10"
            />
          </div>

          <div v-if="!isExistingStockMode" class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.reorderPoint" label="Reorder point" inputmode="numeric" placeholder="5" />
          </div>

          <AppNotice v-if="errorMessage" tone="danger" :title="isExistingStockMode ? 'Adjust stock failed' : 'Add stock failed'">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
            <NuxtLink class="secondary-link" :to="`/inventory/${inventoryId}?tab=operations`">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" :disabled="!canAddStock || !form.warehouseId">
              {{ isExistingStockMode ? "Adjust stock" : "Add stock to warehouse" }}
            </AppButton>
          </div>
        </form>
      </AppPanel>

    </section>
  </div>
</template>
