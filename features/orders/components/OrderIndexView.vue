<script setup lang="ts">
import type { OrderIndexPageState } from "~/features/orders/composables/useOrderIndexPage";

const props = defineProps<{
  page: OrderIndexPageState;
}>();

const {
  applyFilters,
  clearFilters,
  error,
  loadErrorMessage,
  localCreatedFrom,
  localCreatedTo,
  localKeyword,
  localPaymentStatus,
  localStatus,
  localWarehouseId,
  orderStatusOptions,
  orders,
  page,
  pageSize,
  pageSizeOptions,
  paymentStatusOptions,
  pending,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  lastItemNumber,
  summaryStats,
  totalOrders,
  totalPages,
  warehouseOptions,
  warehousesPending,
} = props.page;
</script>

<template>
  <AppIndexPage
    eyebrow="Order queue"
    search-label="Search orders"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="orders"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :items-length="orders.length"
    empty-title="No orders found"
    empty-detail="Adjust the filters or wait for storefront checkout to create orders."
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
      <AppInput v-model="localKeyword" label="" placeholder="Order number, recipient, or phone" @keyup.enter="applyFilters" />
    </template>

    <template #actions>
      <div class="grid gap-4 sm:grid-cols-1 lg:w-[320px] mr-3">
        <AppSelect
          v-model="localWarehouseId"
          label="Warehouse"
          :disabled="warehousesPending"
          :options="warehouseOptions"
        />
      </div>
      <AppButton variant="primary" @click="applyFilters">
        Search
      </AppButton>
      <AppButton variant="primary" @click="clearFilters">
        Refresh
      </AppButton>
    </template>

    <template #filters>
      <div class="grid w-full gap-4 md:grid-cols-4">
        <AppSelect v-model="localStatus" label="Order status" :options="orderStatusOptions" />
        <AppSelect v-model="localPaymentStatus" label="Payment status" :options="paymentStatusOptions" />
        <AppInput v-model="localCreatedFrom" label="Created from" type="date" />
        <AppInput v-model="localCreatedTo" label="Created to" type="date" />
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[1180px]">
        <thead>
          <tr>
            <th class="min-w-[180px]">Order</th>
            <th class="min-w-[130px]">Status</th>
            <th class="min-w-[150px]">Stock</th>
            <th class="min-w-[130px]">Payment</th>
            <th class="min-w-[150px]">Recipient</th>
            <th class="min-w-[120px]">Items</th>
            <th class="min-w-[130px]">Total</th>
            <th class="min-w-[150px]">Created</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <p class="table-title">{{ order.orderNumber }}</p>
            </td>
            <td>
              <AppBadge :tone="order.status === 'Completed' ? 'success' : order.status === 'Cancelled' || order.status === 'ReturnedToSender' ? 'danger' : 'default'">
                {{ order.status }}
              </AppBadge>
            </td>
            <td>
              <AppBadge :tone="order.stockReservationStatus === 'Reserved' || order.stockReservationStatus === 'Committed' ? 'success' : order.stockReservationStatus === 'Failed' ? 'danger' : 'default'">
                {{ order.stockReservationStatus }}
              </AppBadge>
            </td>
            <td>
              <AppBadge :tone="order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'danger' : 'warning'">
                {{ order.paymentStatus }}
              </AppBadge>
            </td>
            <td>
              <p class="text-sm font-medium text-ink">{{ order.recipientName }}</p>
              <p class="table-copy">{{ order.recipientPhone }}</p>
            </td>
            <td>{{ order.items.length }}</td>
            <td>{{ order.totalAmount.toLocaleString() }}</td>
            <td>{{ new Date(order.createdAt).toLocaleString() }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/orders/${order.id}`">
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
