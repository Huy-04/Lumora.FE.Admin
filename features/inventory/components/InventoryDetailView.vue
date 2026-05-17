<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import InventoryOverviewTab from "~/features/inventory/components/InventoryOverviewTab.vue";
import type { InventoryDetailPageState } from "~/features/inventory/composables/useInventoryDetailPage";

const props = defineProps<{
  page: InventoryDetailPageState;
}>();

const {
  actionError,
  actionPending,
  activeTab,
  canRemoveInventory,
  canUpdateInventory,
  error,
  inventory,
  inventoryTabs,
  loadErrorMessage,
  pending,
  removeConfirmOpen,
  removeInventory,
  selectTab,
  setStockActionWarehouse,
  setStockStatus,
  stockActionForm,
  stockStatusOptions,
  warehouseNameById,
  warehouseStatusById,
} = props.page;

const selectInventoryTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  inventoryTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

const stockRowsNeedingAttention = computed(() =>
  inventory.value?.stocks.filter((stock) =>
    stock.alertStatus === "LowStock" || stock.alertStatus === "OutOfStock",
  ).length ?? 0,
);

const stockStatusTone = (status: string) => {
  if (status === "Active") {
    return "success";
  }

  if (status === "OutOfStock") {
    return "danger";
  }

  return "default";
};

const stockAlertTone = (alertStatus: string) => {
  if (alertStatus === "InStock") {
    return "success";
  }

  if (alertStatus === "LowStock") {
    return "warning";
  }

  if (alertStatus === "OutOfStock") {
    return "danger";
  }

  return "default";
};

useScopedPageBreadcrumbs(() =>
  inventory.value
    ? [
        { label: "Inventories", to: "/inventory" },
        { label: inventory.value.sku, to: `/inventory/${inventory.value.id}` },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="inventory?.sku ?? ''"
    :tabs="inventoryTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? loadErrorMessage : null"
    error-title="Unable to load inventory"
    @select-tab="selectInventoryTab"
  >
    <template #modals>
      <AppConfirm
        :open="removeConfirmOpen"
        title="Remove inventory?"
        detail="This deletes the inventory record. It only succeeds when total stock and reserved stock are zero."
        confirm-label="Remove"
        tone="danger"
        :loading="actionPending === 'remove-inventory'"
        @confirm="removeInventory"
        @cancel="removeConfirmOpen = false"
      />
      <AppConfirm
        :open="actionErrorOpen"
        title="Inventory action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />
    </template>

    <template v-if="inventory">
      <InventoryOverviewTab v-if="activeTab === 'overview'" :inventory="inventory" />

      <div v-else-if="activeTab === 'stock'" class="grid gap-4 content-start max-w-6xl">
        <AppPanel
          eyebrow="Current stock"
        >
          <template v-if="canUpdateInventory && inventory.stocks.length === 0" #actions>
            <NuxtLink
              class="secondary-link"
              :to="`/inventory-stocks/${inventory.id}/create`"
            >
              Add warehouse stock
            </NuxtLink>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg border border-line bg-surface px-4 py-3">
              <p class="text-xs font-semibold uppercase text-smoke">Total</p>
              <p class="mt-2 text-2xl font-semibold text-ink">{{ inventory.totalQuantity }}</p>
            </div>
            <div class="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
              <p class="text-xs font-semibold uppercase text-smoke">Available</p>
              <p class="mt-2 text-2xl font-semibold text-emerald-300">{{ inventory.totalAvailableQuantity }}</p>
            </div>
            <div class="rounded-lg border border-line bg-surface px-4 py-3">
              <p class="text-xs font-semibold uppercase text-smoke">Reserved</p>
              <p class="mt-2 text-2xl font-semibold text-ink">{{ inventory.totalReservedQuantity }}</p>
            </div>
            <div
              class="rounded-lg border px-4 py-3"
              :class="stockRowsNeedingAttention > 0 ? 'border-amber-400/30 bg-amber-500/10' : 'border-line bg-surface'"
            >
              <p class="text-xs font-semibold uppercase text-smoke">Needs attention</p>
              <p
                class="mt-2 text-2xl font-semibold"
                :class="stockRowsNeedingAttention > 0 ? 'text-amber-300' : 'text-ink'"
              >
                {{ stockRowsNeedingAttention }}
              </p>
              <p class="mt-1 text-xs text-smoke">{{ inventory.stocks.length }} stock rows</p>
            </div>
          </div>
        </AppPanel>

        <AppPanel eyebrow="Stock rows">
          <template #actions>
            <NuxtLink
              v-if="canUpdateInventory"
              class="secondary-link"
              :to="`/inventory-stocks/${inventory.id}/create`"
            >
              Add warehouse stock
            </NuxtLink>
          </template>

          <div class="table-shell overflow-x-auto">
            <table class="data-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Alert</th>
                  <th>Quantity</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Reorder point</th>
                  <th v-if="canUpdateInventory" class="w-[220px] text-center">Set status</th>
                  <th v-if="canUpdateInventory" class="w-[130px] text-center">Adjust stock</th>
                  <th v-if="canUpdateInventory" class="w-[150px] text-center">Reorder point</th>
                  <th v-if="canRemoveInventory" class="w-[96px] text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stock in inventory.stocks" :key="stock.id">
                  <td>
                    <p class="table-title">{{ warehouseNameById(stock.warehouseId) }}</p>
                  </td>
                  <td class="text-center"><AppBadge :tone="stockStatusTone(stock.status)">{{ stock.status }}</AppBadge></td>
                  <td class="text-center"><AppBadge :tone="stockAlertTone(stock.alertStatus)">{{ stock.alertStatus }}</AppBadge></td>
                  <td>{{ stock.quantity }}</td>
                  <td>{{ stock.reservedQuantity }}</td>
                  <td>{{ stock.availableQuantity }}</td>
                  <td>{{ stock.reorderPoint ?? "None" }}</td>
                  <td v-if="canUpdateInventory" class="text-center">
                    <div class="grid min-w-[200px] grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <AppSelect
                        :model-value="stockActionForm.warehouseId === stock.warehouseId ? stockActionForm.status : stockStatusOptions.find((entry) => entry.label === stock.status)?.value ?? '0'"
                        label=""
                        :options="stockStatusOptions"
                        @update:model-value="(value) => {
                          setStockActionWarehouse(stock.warehouseId);
                          stockActionForm.status = String(value);
                        }"
                      />
                      <AppButton
                        class="table-action"
                        variant="secondary"
                        :loading="actionPending === 'set-status' && stockActionForm.warehouseId === stock.warehouseId"
                        @click="() => {
                          setStockActionWarehouse(stock.warehouseId);
                          setStockStatus();
                        }"
                      >
                        Save
                      </AppButton>
                    </div>
                  </td>
                  <td v-if="canUpdateInventory" class="text-center">
                    <NuxtLink
                      class="secondary-link table-action min-w-[92px]"
                      :to="`/inventory-stocks/${inventory.id}/warehouses/${stock.warehouseId}/add`"
                    >
                      Adjust
                    </NuxtLink>
                  </td>
                  <td v-if="canUpdateInventory" class="text-center">
                    <NuxtLink
                      class="secondary-link table-action min-w-[104px]"
                      :to="`/inventory-stocks/${inventory.id}/warehouses/${stock.warehouseId}/reorder-point`"
                    >
                      Set point
                    </NuxtLink>
                  </td>
                  <td v-if="canRemoveInventory" class="text-center">
                    <AppButton
                      class="table-action"
                      variant="danger"
                      :loading="actionPending === 'remove-inventory'"
                      @click="removeConfirmOpen = true"
                    >
                      Remove
                    </AppButton>
                  </td>
                </tr>
                <tr v-if="!inventory.stocks.length">
                  <td :colspan="(canUpdateInventory ? 10 : 7) + (canRemoveInventory ? 1 : 0)" class="py-10 text-center text-sm text-smoke">
                    No stock rows yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AppPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
