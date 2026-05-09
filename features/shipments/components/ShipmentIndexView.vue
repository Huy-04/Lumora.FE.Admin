<script setup lang="ts">
import type { ShipmentIndexPageState } from "~/features/shipments/composables/useShipmentIndexPage";

const props = defineProps<{
  page: ShipmentIndexPageState;
}>();

const {
  applyFilters,
  carrierOptions,
  canReadShipment,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  lastItemNumber,
  loadErrorMessage,
  localCarrier,
  localKeyword,
  localOrderId,
  localStatus,
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
    eyebrow="Shipment queue"
    search-label="Search shipments"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="shipments"
    :pending="pending"
    :error="!canReadShipment ? 'Missing permission' : error ? 'Error loading data' : null"
    :error-detail="!canReadShipment ? 'You do not have permission to read shipments.' : loadErrorMessage"
    :items-length="shipments.length"
    empty-title="No shipments found"
    empty-detail="Adjust filters or create shipment drafts from processing orders."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    v-model:page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #search-input>
      <AppInput v-if="canReadShipment" v-model="localKeyword" label="" placeholder="Shipment number, order number, or carrier order code" @keyup.enter="applyFilters" />
    </template>

    <template #actions>
      <template v-if="canReadShipment">
        <AppButton variant="primary" @click="applyFilters">
          Search
        </AppButton>
        <AppButton variant="primary" @click="clearFilters">
          Refresh
        </AppButton>
      </template>
    </template>

    <template #filters>
      <template v-if="canReadShipment">
        <div class="lg:w-[340px] mb-4 sm:mb-0 mr-4">
          <AppInput v-model="localOrderId" label="Order id" placeholder="Filter by order id" @keyup.enter="applyFilters" />
        </div>
        <div class="grid gap-4 md:grid-cols-2 flex-1">
          <AppSelect v-model="localStatus" label="Shipment status" :options="shipmentStatusOptions" />
          <AppSelect v-model="localCarrier" label="Carrier" :options="carrierOptions" />
        </div>
      </template>
    </template>

    <template #table>
      <table v-if="canReadShipment" class="data-table min-w-[1040px]">
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
