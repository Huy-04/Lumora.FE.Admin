<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { InventoryIndexPageState } from "~/features/inventory/composables/useInventoryIndexPage";

const props = defineProps<{
  page: InventoryIndexPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  canCreateInventory,
  createInventory,
  createInventoryOpen,
  error,
  firstInventoryNumber,
  goToNextInventoryPage,
  goToPreviousInventoryPage,
  inventories,
  inventoryForm,
  inventoryPage,
  inventoryPageSize,
  inventoryPageSizeOptions,
  inventoryTotalPages,
  lastInventoryNumber,
  loadErrorMessage,
  pending,
  refresh,
  summaryStats,
  totalInventories,
} = props.page;
</script>

<template>
  <AppIndexPage
    eyebrow="Inventory workspace"
    search-label="Manage Inventory"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="inventories"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-success="actionSuccess"
    action-success-title="Inventory updated"
    :action-error="actionError"
    action-error-title="Inventory action failed"
    :items-length="inventories.length"
    empty-title="No inventories found"
    empty-detail="Create inventory after Product variants exist."
    :first-item-number="firstInventoryNumber"
    :last-item-number="lastInventoryNumber"
    v-model:page-size="inventoryPageSize"
    :page-size-options="inventoryPageSizeOptions"
    :page="inventoryPage"
    :total-pages="inventoryTotalPages"
    @previous-page="goToPreviousInventoryPage"
    @next-page="goToNextInventoryPage"
  >
    <template #actions>
      <AppButton v-if="canCreateInventory" variant="primary" @click="createInventoryOpen = !createInventoryOpen">
        Create inventory
      </AppButton>
      <AppButton aria-label="Reload inventory" class="toolbar-refresh-button" icon-only variant="secondary" @click="refresh">
        <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
      </AppButton>
    </template>

    <template #filters>
      <div v-if="createInventoryOpen" class="w-full mt-2 soft-card">
        <form class="grid gap-4 md:grid-cols-[1fr_auto]" @submit.prevent="createInventory">
          <AppInput v-model="inventoryForm.productVariantId" label="Product variant id" placeholder="Variant id from Product module" />
          <div class="flex items-end">
            <AppButton :loading="actionPending === 'create-inventory'" type="submit">
              Create
            </AppButton>
          </div>
        </form>
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[820px]">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Total</th>
            <th>Reserved</th>
            <th>Available</th>
            <th>Stocks</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inventory in inventories" :key="inventory.id">
            <td>
              <p class="table-title">{{ inventory.sku }}</p>
              <p class="table-copy">{{ inventory.productVariantId }}</p>
            </td>
            <td>{{ inventory.totalQuantity }}</td>
            <td>{{ inventory.totalReservedQuantity }}</td>
            <td>{{ inventory.totalAvailableQuantity }}</td>
            <td>{{ inventory.stocks.length }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/inventory/${inventory.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
