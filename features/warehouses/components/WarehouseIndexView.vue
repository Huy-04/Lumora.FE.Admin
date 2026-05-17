<script setup lang="ts">
import type { WarehouseIndexPageState } from "~/features/warehouses/composables/useWarehouseIndexPage";

const props = defineProps<{
  page: WarehouseIndexPageState;
}>();

const {
  actionError,
  actionPending,
  applyFilters,
  canCreateWarehouse,
  canRemoveWarehouse,
  clearFilters,
  error,
  firstItemNumber,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pagedWarehouses,
  pageSize,
  pageSizeOptions,
  pending,
  removeWarehouse,
  summaryStats,
  totalPages,
  warehouseStatusOptions,
  warehouses,
  goToNextPage,
  goToPreviousPage,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Warehouse management"
    search-label="Manage Warehouses"
    search-placeholder="Search by name or address"
    create-route="/warehouses/create"
    create-label="Create warehouse"
    :can-create="canCreateWarehouse"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="warehouses"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-error="actionError"
    action-error-title="Warehouse action failed"
    :items-length="pagedWarehouses.length"
    empty-title="No warehouses found"
    empty-detail="Create at least one warehouse before adding stock."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    :page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @search="applyFilters"
    @refresh="clearFilters"
    @update:page-size="pageSize = String($event)"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.statusFilter.value"
          label="Status"
          :options="warehouseStatusOptions"
        />
      </div>
    </template>

    <template #table>
      <table class="data-table">
        <thead>
          <tr>
            <th>Warehouse</th>
            <th>Code</th>
            <th>Status</th>
            <th>GHN</th>
            <th class="w-[96px] text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="warehouse in pagedWarehouses" :key="warehouse.id">
            <td>
              <p class="table-title">{{ warehouse.name }}</p>
              <p class="table-copy">{{ warehouse.address }}</p>
            </td>
            <td>{{ warehouse.code }}</td>
            <td>
              <AppBadge :tone="warehouse.status === 'Active' ? 'success' : 'default'">
                {{ warehouse.status }}
              </AppBadge>
            </td>
            <td>
              <AppBadge :tone="warehouse.ghnStore ? 'success' : 'warning'">
                {{ warehouse.ghnStore ? "Synced" : "Not synced" }}
              </AppBadge>
            </td>
            <td>
              <div class="flex items-center justify-center gap-2">
                <NuxtLink class="secondary-link table-action" :to="`/warehouses/${warehouse.id}`">
                  Open
                </NuxtLink>
                <button
                  v-if="canRemoveWarehouse && warehouse.status === 'Inactive'"
                  class="danger-link table-action"
                  :disabled="actionPending === warehouse.id"
                  @click="removeWarehouse(warehouse.id)"
                >
                  Remove
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
