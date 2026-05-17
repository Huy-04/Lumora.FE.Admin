<script setup lang="ts">
import type { InventoryIndexPageState } from "~/features/inventory/composables/useInventoryIndexPage";

const props = defineProps<{
  page: InventoryIndexPageState;
}>();

const {
  actionError,
  actionPending,
  applyFilters,
  canCreateInventory,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  inventories,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  stockStatusFilterOptions,
  summaryStats,
  totalPages,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Inventory workspace"
    search-label="Inventory"
    search-placeholder="Search inventory..."
    create-route="/inventory/create"
    create-label="Create inventory"
    :can-create="canCreateInventory"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="inventories"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-error="actionError"
    action-error-title="Inventory action failed"
    :items-length="inventories.length"
    empty-title="No inventories found"
    empty-detail="Create inventory after Product variants exist."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    v-model:page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @search="applyFilters"
    @refresh="clearFilters"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #filters>
      <div class="w-full flex flex-col gap-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="w-full sm:flex-1">
            <AppSelect
              v-model="localFilters.stockStatus.value"
              label="Stock status"
              :options="stockStatusFilterOptions"
            />
          </div>
        </div>
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
