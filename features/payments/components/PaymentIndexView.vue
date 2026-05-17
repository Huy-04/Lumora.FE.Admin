<script setup lang="ts">
import type { PaymentIndexPageState } from "~/features/payments/composables/usePaymentIndexPage";

const props = defineProps<{
  page: PaymentIndexPageState;
}>();

const {
  applyFilters,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  paymentMethodOptions,
  paymentProviderOptions,
  paymentStatusOptions,
  payments,
  pending,
  summaryStats,
  totalPages,
} = props.page;

const statusTone = (status: string) => {
  if (status === "Succeeded") return "success";
  if (status === "Failed") return "danger";
  if (status === "Pending" || status === "Processing") return "warning";
  return "default";
};
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Payment ledger"
    search-label="Search payments"
    search-placeholder="Order number, transaction, or failure text"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="payments"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :items-length="payments.length"
    empty-title="No payments found"
    empty-detail="Adjust filters or wait for checkout/payment events to create payments."
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
      <div class="grid w-full gap-4 md:grid-cols-3 lg:grid-cols-5">
        <AppSelect v-model="localFilters.status.value" label="Status" :options="paymentStatusOptions" />
        <AppSelect v-model="localFilters.method.value" label="Method" :options="paymentMethodOptions" />
        <AppSelect v-model="localFilters.provider.value" label="Provider" :options="paymentProviderOptions" />
        <AppInput v-model="localFilters.createdFrom.value" label="Created from" type="date" />
        <AppInput v-model="localFilters.createdTo.value" label="Created to" type="date" />
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[1240px]">
        <thead>
          <tr>
            <th class="min-w-[210px]">Payment</th>
            <th class="min-w-[210px]">Order</th>
            <th class="min-w-[110px]">Status</th>
            <th class="min-w-[110px]">Method</th>
            <th class="min-w-[110px]">Provider</th>
            <th class="min-w-[130px]">Amount</th>
            <th class="min-w-[180px]">Failure</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td>
              <p class="table-title">{{ payment.id }}</p>
              <p class="table-copy">{{ payment.userId }}</p>
            </td>
            <td class="break-all">{{ payment.orderId }}</td>
            <td><AppBadge :tone="statusTone(payment.status)">{{ payment.status }}</AppBadge></td>
            <td>{{ payment.method }}</td>
            <td>{{ payment.provider }}</td>
            <td>{{ payment.amount.toLocaleString() }} {{ payment.currency }}</td>
            <td>{{ payment.failureMessage || payment.failureCode || "None" }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/payments/${payment.id}`">Open</NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
