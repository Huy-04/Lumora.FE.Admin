<script setup lang="ts">
import type { CouponIndexPageState } from "~/features/coupons/composables/useCouponIndexPage";

const props = defineProps<{
  page: CouponIndexPageState;
}>();

const {
  applyFilters,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  items,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  totalItems,
  totalPages,
} = props.page;

const authz = useAdminAuthorization();
const canCreateCoupon = computed(() => authz.can(ADMIN_PERMISSION.couponModifyAll));

const statusTone = (coupon: { isActive: boolean; isExpired: boolean; isUpcoming: boolean }) => {
  if (coupon.isExpired) return "danger";
  if (coupon.isUpcoming) return "warning";
  if (coupon.isActive) return "success";
  return "default";
};

const statusLabel = (coupon: { isActive: boolean; isExpired: boolean; isUpcoming: boolean }) => {
  if (coupon.isExpired) return "Expired";
  if (coupon.isUpcoming) return "Upcoming";
  if (coupon.isActive) return "Active";
  return "Inactive";
};

const isActiveOptions = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const sortByOptions = [
  { label: "Default", value: "" },
  { label: "Code", value: "code" },
  { label: "Percent", value: "percent" },
  { label: "Starts at", value: "startsAt" },
  { label: "Expires at", value: "expiresAt" },
];

const sortDirectionOptions = [
  { label: "Ascending", value: "" },
  { label: "Descending", value: "desc" },
];
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Coupon records"
    search-label="Search coupons"
    search-placeholder="Search by coupon code"
    create-route="/coupons/create"
    create-label="Create coupon"
    :can-create="canCreateCoupon"
    :total-items="totalItems"
    item-label="coupons"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :items-length="items.length"
    empty-title="No coupons found"
    empty-detail="Adjust the filters or create the first coupon."
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
      <div class="grid w-full gap-4 md:grid-cols-5">
        <AppSelect
          v-model="localFilters.isActive.value"
          label="Status"
          :options="isActiveOptions"
        />
        <AppInput v-model="localFilters.startsFrom.value" label="Starts from" type="date" />
        <AppInput v-model="localFilters.expiresTo.value" label="Expires to" type="date" />
        <AppSelect
          v-model="localFilters.sortBy.value"
          label="Sort by"
          :options="sortByOptions"
        />
        <AppSelect
          v-model="localFilters.sortDirection.value"
          label="Direction"
          :options="sortDirectionOptions"
        />
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[1080px]">
        <thead>
          <tr>
            <th class="min-w-[160px]">Code</th>
            <th class="min-w-[100px]">Percent</th>
            <th class="min-w-[140px]">Max discount</th>
            <th class="min-w-[110px]">Status</th>
            <th class="min-w-[160px]">Starts at</th>
            <th class="min-w-[160px]">Expires at</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coupon in items" :key="coupon.id">
            <td>
              <p class="table-title">{{ coupon.code }}</p>
            </td>
            <td>{{ coupon.percent }}%</td>
            <td>{{ coupon.maxDiscountAmount.toLocaleString() }}</td>
            <td>
              <AppBadge :tone="statusTone(coupon)">
                {{ statusLabel(coupon) }}
              </AppBadge>
            </td>
            <td>{{ new Date(coupon.startsAt).toLocaleString() }}</td>
            <td>{{ new Date(coupon.expiresAt).toLocaleString() }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/coupons/${coupon.id}`">
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
