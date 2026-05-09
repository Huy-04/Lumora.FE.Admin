<script setup lang="ts">
import type { WarehouseIndexPageState } from "~/features/warehouses/composables/useWarehouseIndexPage";

const props = defineProps<{
  page: WarehouseIndexPageState;
}>();

const {
  actionError,
  actionPending,
  canCreateWarehouse,
  canReadWarehouse,
  createWarehouse,
  createWarehouseOpen,
  error,
  loadErrorMessage,
  pending,
  refresh,
  summaryStats,
  warehouseCodeOptions,
  warehouseForm,
  warehouses,
} = props.page;
</script>

<template>
  <AppIndexPage
    eyebrow="Warehouse management"
    search-label="Manage Warehouses"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="warehouses"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :action-error="actionError"
    action-error-title="Warehouse action failed"
    :items-length="warehouses.length"
    empty-title="No warehouses found"
    empty-detail="Create at least one warehouse before adding stock."
  >
    <template #actions>
      <AppButton v-if="canCreateWarehouse" variant="primary" @click="createWarehouseOpen = !createWarehouseOpen">
        Create warehouse
      </AppButton>
      <AppButton variant="primary" @click="refresh">
        Refresh
      </AppButton>
    </template>

    <template #filters>
      <div v-if="createWarehouseOpen" class="w-full mt-2 soft-card">
        <form class="grid gap-4 lg:grid-cols-3" @submit.prevent="createWarehouse">
          <AppSelect v-model="warehouseForm.code" label="Warehouse code" :options="warehouseCodeOptions" />
          <AppInput v-model="warehouseForm.name" label="Name" />
          <AppInput v-model="warehouseForm.phoneNational" label="Phone" />
          <AppInput v-model="warehouseForm.address" class="lg:col-span-2" label="Address" />
          <div class="flex items-end">
            <AppButton :loading="actionPending === 'create-warehouse'" type="submit">
              Create
            </AppButton>
          </div>
        </form>
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
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="warehouse in warehouses" :key="warehouse.id">
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
            <td>{{ warehouse.ghnStore ? warehouse.ghnStore.shopName : "Not synced" }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/warehouses/${warehouse.id}`">
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
