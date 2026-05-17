<script setup lang="ts">
import type { ShipmentIndexPageState } from "~/features/shipments/composables/useShipmentIndexPage";

const props = defineProps<{
  page: ShipmentIndexPageState;
}>();

const {
  applyFilters,
  canCreateShipment,
  carrierOptions,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  hasActiveFilters,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  shipmentStatusOptions,
  shipments,
  summaryStats,
  totalPages,
  totalShipments,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Shipment queue"
    search-label="Search shipments"
    search-placeholder="Shipment number, order number, order ID, or carrier order code"
    create-route="/shipments/create"
    create-label="Create shipment"
    :can-create="canCreateShipment"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="shipments"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :items-length="shipments.length"
    empty-title="No shipments found"
    empty-detail="Adjust filters or create shipment drafts from processing orders."
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
    <template #notices>
      <AppNotice v-if="error" tone="danger" title="Unable to load data">
        {{ loadErrorMessage }}
      </AppNotice>
    </template>

    <template #filters>
      <div class="w-full flex flex-col gap-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="w-full sm:flex-1">
            <AppSelect v-model="localFilters.status.value" label="Shipment status" :options="shipmentStatusOptions" />
          </div>
          <div class="w-full sm:flex-1">
            <AppSelect v-model="localFilters.carrier.value" label="Carrier" :options="carrierOptions" />
          </div>
        </div>
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[1040px]">
        <thead>
          <tr>
            <th class="min-w-[190px]">Shipment</th>
            <th class="min-w-[190px]">Order</th>
            <th class="min-w-[130px]">Status</th>
            <th class="min-w-[110px]">Carrier</th>
            <th class="min-w-[170px]">Carrier order</th>
            <th class="min-w-[120px]">Carrier shop</th>
            <th class="min-w-[150px]">Created</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shipment in shipments" :key="shipment.id">
            <td>
              <p class="table-title">{{ shipment.shipmentNumber }}</p>
            </td>
            <td>
              <p class="table-title">{{ shipment.orderNumber }}</p>
            </td>
            <td>
              <AppBadge :tone="shipment.status === 'Delivered' ? 'success' : shipment.status === 'Cancelled' || shipment.status === 'Failed' || shipment.status === 'Returned' ? 'danger' : shipment.status === 'Draft' ? 'warning' : 'default'">
                {{ shipment.status }}
              </AppBadge>
            </td>
            <td>{{ shipment.carrier }}</td>
            <td>{{ shipment.carrierOrderCode ?? "Not submitted" }}</td>
            <td>{{ shipment.carrierShopId ?? "Not submitted" }}</td>
            <td>{{ new Date(shipment.createdAt).toLocaleString() }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/shipments/${shipment.id}`">
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
