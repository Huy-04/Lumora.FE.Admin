<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { ShipmentIndexPageState } from "~/features/shipments/composables/useShipmentIndexPage";

const props = defineProps<{
  page: ShipmentIndexPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  applyFilters,
  carrierOptions,
  canModifyShipment,
  canReadShipment,
  clearFilters,
  createForm,
  createShipment,
  error,
  firstItemNumber,
  foundShipmentId,
  goToNextPage,
  goToPreviousPage,
  hasFilters,
  lastItemNumber,
  loadErrorMessage,
  localCarrier,
  localKeyword,
  localOrderId,
  localStatus,
  lookupByOrderId,
  lookupForm,
  openShipmentById,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  refresh,
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
      <AppInput v-if="canReadShipment" v-model="localKeyword" label="" placeholder="Shipment number or carrier order code" @keyup.enter="applyFilters" />
    </template>

    <template #actions>
      <template v-if="canReadShipment">
        <AppButton variant="primary" @click="applyFilters">
          Search
        </AppButton>
        <AppButton v-if="hasFilters" variant="secondary" @click="clearFilters">
          Clear
        </AppButton>
        <AppButton aria-label="Reload shipments" class="toolbar-refresh-button" icon-only variant="secondary" @click="refresh">
          <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
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
      <table v-if="canReadShipment" class="data-table min-w-[1060px]">
        <thead>
          <tr>
            <th class="min-w-[190px]">Shipment</th>
            <th class="min-w-[130px]">Status</th>
            <th class="min-w-[110px]">Carrier</th>
            <th class="min-w-[190px]">Order</th>
            <th class="min-w-[170px]">Carrier order</th>
            <th class="min-w-[150px]">Created</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shipment in shipments" :key="shipment.id">
            <td>
              <p class="table-title">{{ shipment.shipmentNumber }}</p>
              <p class="table-copy">{{ shipment.id }}</p>
            </td>
            <td>
              <AppBadge :tone="shipment.status === 'Delivered' ? 'success' : shipment.status === 'Cancelled' || shipment.status === 'Failed' || shipment.status === 'Returned' ? 'danger' : shipment.status === 'Draft' ? 'warning' : 'default'">
                {{ shipment.status }}
              </AppBadge>
            </td>
            <td>{{ shipment.carrier }}</td>
            <td class="table-copy">{{ shipment.orderId }}</td>
            <td>{{ shipment.carrierOrderCode ?? "Not submitted" }}</td>
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

    <template #after>
      <div class="grid gap-6 mt-6">
        <AppPanel v-if="canReadShipment" title="Lookup tools" description="Use direct lookup when an id comes from logs, order context, or support notes.">
          <div class="grid gap-6 xl:grid-cols-2">
            <form class="soft-card grid gap-4" @submit.prevent="openShipmentById">
              <div>
                <p class="section-title">Open shipment</p>
                <p class="section-copy">Use when the shipment id is already known.</p>
              </div>
              <AppInput v-model="lookupForm.shipmentId" label="Shipment id" placeholder="Shipment id" />
              <AppButton type="submit">Open shipment</AppButton>
            </form>

            <form class="soft-card grid gap-4" @submit.prevent="lookupByOrderId">
              <div>
                <p class="section-title">Find by order</p>
                <p class="section-copy">Backend keeps one shipment per order and returns 404 when no draft exists.</p>
              </div>
              <AppInput v-model="lookupForm.orderId" label="Order id" placeholder="Order id" />
              <div class="flex flex-wrap gap-3">
                <AppButton :loading="actionPending === 'lookup-order'" type="submit">
                  Find shipment
                </AppButton>
                <NuxtLink v-if="foundShipmentId" class="secondary-link table-action" :to="`/shipments/${foundShipmentId}`">
                  Open found shipment
                </NuxtLink>
              </div>
            </form>
          </div>

          <AppNotice v-if="actionSuccess" class="mt-6" tone="success" title="Shipment found">
            {{ actionSuccess }}
          </AppNotice>
          <AppNotice v-if="actionError" class="mt-6" tone="danger" title="Shipment action failed">
            {{ actionError }}
          </AppNotice>
        </AppPanel>

        <AppPanel v-if="canModifyShipment" title="Create local draft" description="Creates a local shipment draft for a Processing order. Carrier submit is a separate action.">
          <form class="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" @submit.prevent="createShipment">
            <AppInput v-model="createForm.orderId" label="Order id" placeholder="Processing order id" />
            <AppInput v-model="createForm.shipmentNumber" label="Shipment number" placeholder="Optional" />
            <div class="flex items-end">
              <AppButton :loading="actionPending === 'create'" type="submit">
                Create draft
              </AppButton>
            </div>
          </form>
        </AppPanel>
      </div>
    </template>
  </AppIndexPage>
</template>
