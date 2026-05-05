<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { InventoryDetailPageState } from "~/features/inventory/composables/useInventoryDetailPage";

const props = defineProps<{
  page: InventoryDetailPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  addStock,
  addStockForm,
  adjustQuantity,
  canRemoveInventory,
  canUpdateInventory,
  error,
  inventory,
  loadErrorMessage,
  pending,
  refresh,
  removeConfirmOpen,
  removeInventory,
  setLowStockThreshold,
  setStockActionWarehouse,
  setStockStatus,
  stockActionForm,
  stockStatusOptions,
} = props.page;
</script>

<template>
  <div class="page-shell">
    <AppConfirm
      :open="removeConfirmOpen"
      title="Remove inventory?"
      detail="Backend only allows removal when all stock and reserved quantities are zero."
      confirm-label="Remove"
      tone="danger"
      :loading="actionPending === 'remove-inventory'"
      @confirm="removeInventory"
      @cancel="removeConfirmOpen = false"
    />

    <AppPanel v-if="inventory" eyebrow="Inventory detail" :title="inventory.sku" description="Manage stock rows, availability status, and low-stock thresholds.">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <AppBadge>Total {{ inventory.totalQuantity }}</AppBadge>
          <AppBadge :tone="inventory.totalAvailableQuantity > 0 ? 'success' : 'warning'">Available {{ inventory.totalAvailableQuantity }}</AppBadge>
          <AppBadge>Reserved {{ inventory.totalReservedQuantity }}</AppBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <AppButton aria-label="Reload inventory" icon-only variant="secondary" @click="refresh">
            <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
          </AppButton>
          <AppButton v-if="canRemoveInventory" variant="danger" @click="removeConfirmOpen = true">
            Remove
          </AppButton>
        </div>
      </div>
      <AppNotice v-if="actionSuccess" class="mt-6" tone="success" title="Inventory updated">{{ actionSuccess }}</AppNotice>
      <AppNotice v-if="actionError" class="mt-6" tone="danger" title="Inventory action failed">{{ actionError }}</AppNotice>
    </AppPanel>

    <AppNotice v-if="error" tone="danger" title="Unable to load inventory">{{ loadErrorMessage }}</AppNotice>
    <div v-if="pending" class="soft-card h-64 animate-pulse" />

    <template v-else-if="inventory">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <AppStat label="Total" :value="`${inventory.totalQuantity}`" detail="All units across warehouses." />
        <AppStat label="Available" :value="`${inventory.totalAvailableQuantity}`" detail="Sellable units after reservations." />
        <AppStat label="Reserved" :value="`${inventory.totalReservedQuantity}`" detail="Units reserved by orders." />
        <AppStat label="Stock rows" :value="`${inventory.stocks.length}`" detail="Warehouse-specific rows." />
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AppPanel title="Stock rows" description="Each warehouse can have one stock row.">
          <div class="table-shell overflow-x-auto">
            <table class="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th>Quantity</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Threshold</th>
                  <th class="w-[120px] text-center">Select</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stock in inventory.stocks" :key="stock.id">
                  <td>{{ stock.warehouseId }}</td>
                  <td><AppBadge>{{ stock.status }}</AppBadge></td>
                  <td>{{ stock.quantity }}</td>
                  <td>{{ stock.reservedQuantity }}</td>
                  <td>{{ stock.availableQuantity }}</td>
                  <td>{{ stock.lowStockThreshold ?? "None" }}</td>
                  <td>
                    <div class="flex justify-center">
                      <AppButton class="table-action" variant="secondary" @click="setStockActionWarehouse(stock.warehouseId)">
                        Select
                      </AppButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AppPanel>

        <div class="grid gap-6">
          <AppPanel v-if="canUpdateInventory" title="Add stock" description="Create a stock row for a warehouse that is not already attached.">
            <form class="grid gap-4" @submit.prevent="addStock">
              <AppInput v-model="addStockForm.warehouseId" label="Warehouse id" />
              <AppInput v-model.number="addStockForm.quantity" label="Quantity" type="number" />
              <AppInput v-model.number="addStockForm.lowStockThreshold" label="Low-stock threshold" type="number" />
              <AppButton :loading="actionPending === 'add-stock'" type="submit">Add stock</AppButton>
            </form>
          </AppPanel>

          <AppPanel v-if="canUpdateInventory" title="Selected stock action" description="Adjust quantity, status, or low-stock threshold for a selected warehouse row.">
            <div class="grid gap-4">
              <AppInput v-model="stockActionForm.warehouseId" label="Warehouse id" />
              <AppInput v-model.number="stockActionForm.delta" label="Quantity delta" type="number" />
              <AppButton :loading="actionPending === 'adjust-quantity'" @click="adjustQuantity">Adjust quantity</AppButton>
              <AppSelect v-model="stockActionForm.status" label="Status" :options="stockStatusOptions" />
              <AppButton :loading="actionPending === 'set-status'" @click="setStockStatus">Set status</AppButton>
              <AppInput v-model.number="stockActionForm.threshold" label="Low-stock threshold" type="number" />
              <AppButton :loading="actionPending === 'set-threshold'" @click="setLowStockThreshold">Set threshold</AppButton>
            </div>
          </AppPanel>
        </div>
      </div>
    </template>
  </div>
</template>
