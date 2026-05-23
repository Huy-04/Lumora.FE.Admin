<script setup lang="ts">
import { PhShoppingCart, PhCreditCard, PhTruck, PhPackage, PhTree, PhClipboardText, PhWarehouse, PhCurrencyDollarSimple, PhWarning, PhLockKey } from "@phosphor-icons/vue";
import type { DashboardPageState } from "~/features/dashboard/composables/useDashboardPage";
import { getProblemStatus } from "~/Shared/api/apiErrors";

const props = defineProps<{
  page: DashboardPageState;
}>();

const { stats, pending, error, fromDate, toDate, trendFilterError, trendPending, trendError, loadOrderTrends, applyTrendFilter } = props.page;

const isAccessDenied = computed(() => getProblemStatus(error.value) === 403);

const barWidth = (value: number, total: number) => {
  if (total === 0) return "0%";
  return `${Math.max(2, (value / total) * 100)}%`;
};

const chartWidth = 720;
const chartHeight = 230;
const chartPadding = { top: 18, right: 18, bottom: 32, left: 34 };

const hasTrendData = computed(() => stats.value.orderTrend.some((d: { count: number }) => d.count > 0));

const trendTotal = computed(() =>
  stats.value.orderTrend.reduce((total: number, point: { count: number }) => total + point.count, 0),
);

const trendLabelStep = computed(() => {
  const count = stats.value.orderTrend.length;
  if (count > 16) return Math.ceil(count / 8);
  if (count > 10) return 2;
  return 1;
});

const maxTrendCount = computed(() => {
  const max = Math.max(1, ...stats.value.orderTrend.map((d: { count: number }) => d.count));
  if (max <= 5) return 5;
  return Math.ceil(max / 5) * 5;
});

const trendPoints = computed(() => {
  const days = stats.value.orderTrend;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const step = days.length > 1 ? plotWidth / (days.length - 1) : 0;

  return days.map((day: { date: string; label?: string; count: number }, index: number) => ({
    ...day,
    x: days.length > 1 ? chartPadding.left + step * index : chartPadding.left + plotWidth / 2,
    y: chartPadding.top + plotHeight - (day.count / maxTrendCount.value) * plotHeight,
    showLabel: index === 0 || index === days.length - 1 || index % trendLabelStep.value === 0,
  }));
});

const trendLinePath = computed(() => {
  if (!trendPoints.value.length) return "";
  return trendPoints.value.reduce((path, point, index, points) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = previous.x + (point.x - previous.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
});

const trendAreaPath = computed(() => {
  if (!trendPoints.value.length) return "";
  const first = trendPoints.value[0];
  const last = trendPoints.value[trendPoints.value.length - 1];
  const baseline = chartHeight - chartPadding.bottom;
  return `${trendLinePath.value} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
});

const trendGridLines = computed(() => [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const value = Math.round(maxTrendCount.value * ratio);
  return {
    value,
    y: chartPadding.top + plotHeight * (1 - ratio),
  };
}));

const formatTrendLabel = (point: { date: string; label?: string }) => {
  if (point.label) return point.label;
  return new Date(point.date).toLocaleDateString("en", { weekday: "short" });
};

const formatMoney = (value: number) => `${Math.round(value).toLocaleString()} VND`;
const selectedTrendRangeLabel = computed(() => `${fromDate.value} to ${toDate.value}`);

const statCards = computed(() => [
  {
    label: "Revenue",
    value: formatMoney(stats.value.revenue.today),
    note: `${formatMoney(stats.value.revenue.thisMonth)} this month`,
    to: "/payments",
    icon: PhCurrencyDollarSimple,
    iconClass: "bg-success/10 text-success",
  },
  {
    label: "Orders",
    value: stats.value.orders.total,
    note: `${stats.value.orders.pending} pending`,
    to: "/orders",
    icon: PhShoppingCart,
    iconClass: "bg-brass/10 text-brass",
  },
  {
    label: "Payments",
    value: stats.value.payments.total,
    note: `${stats.value.payments.succeeded} succeeded`,
    to: "/payments",
    icon: PhCreditCard,
    iconClass: "bg-success/10 text-success",
  },
  {
    label: "Shipments",
    value: stats.value.shipments.total,
    note: `${stats.value.shipments.inTransit} in transit`,
    to: "/shipments",
    icon: PhTruck,
    iconClass: "bg-warning/10 text-warning",
  },
  {
    label: "Products",
    value: stats.value.products.total,
    note: `${stats.value.products.published} published`,
    to: "/products",
    icon: PhPackage,
    iconClass: "bg-ember/10 text-ember",
  },
]);

const manageCards = [
  { label: "Products", copy: "Catalog and variants", to: "/products", icon: PhPackage },
  { label: "Categories", copy: "Catalog structure", to: "/categories", icon: PhTree },
  { label: "Inventory", copy: "Stock and quantities", to: "/inventory", icon: PhClipboardText },
  { label: "Warehouses", copy: "Locations and GHN", to: "/warehouses", icon: PhWarehouse },
];
</script>

<template>
  <div class="page-shell dashboard-page">
    <!-- 7.2: Access denied state when BE returns 403 -->
    <div v-if="isAccessDenied" class="grid place-items-center gap-4 py-16 text-center">
      <div class="rounded-full bg-danger/10 p-4">
        <PhLockKey :size="32" weight="duotone" class="text-danger" />
      </div>
      <h2 class="text-lg font-semibold text-ink">Access Denied</h2>
      <p class="max-w-md text-sm text-smoke">
        You do not have the required permission <code class="rounded bg-surface px-1.5 py-0.5 text-xs font-medium text-ink">Auth.Admin.Access.All</code> to view the dashboard.
      </p>
      <NuxtLink to="/products" class="mt-2 text-sm font-medium text-brass hover:underline">
        Go to Products
      </NuxtLink>
    </div>

    <div v-else class="grid gap-6">
      <div v-if="!pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <NuxtLink v-for="card in statCards" :key="card.label" :to="card.to" class="dashboard-stat-card group">
          <div class="dashboard-stat-icon" :class="card.iconClass">
            <component :is="card.icon" v-if="card.icon" :size="22" weight="duotone" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="dashboard-stat-label">{{ card.label }}</p>
            <p class="dashboard-stat-value">{{ card.value }}</p>
            <p class="dashboard-stat-note">{{ card.note }}</p>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="i in 5" :key="i" class="dashboard-stat-card animate-pulse">
          <div class="h-12 w-full rounded" />
        </div>
      </div>

      <div v-if="!pending" class="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <div class="dashboard-chart-card">
          <div class="dashboard-card-heading">
            <div>
              <h3 class="dashboard-chart-title">Orders Trend</h3>
              <p class="dashboard-chart-subtitle">{{ trendTotal }} orders in {{ selectedTrendRangeLabel }}</p>
            </div>
            <div class="dashboard-range-control items-end" aria-label="Order trend range">
              <AppInput v-model="fromDate" label="From" type="date" />
              <AppInput v-model="toDate" label="To" type="date" />
              <AppButton variant="primary" :disabled="trendPending || Boolean(trendFilterError)" @click="applyTrendFilter">
                Apply
              </AppButton>
            </div>
          </div>
          <p v-if="trendFilterError" class="text-sm text-danger">{{ trendFilterError }}</p>
          <div class="dashboard-line-chart mt-4">
            <!-- 7.1: Trend error state with retry -->
            <div v-if="trendError" class="grid place-items-center gap-3 py-10 text-center">
              <PhWarning :size="28" weight="duotone" class="text-danger" />
              <p class="text-sm text-smoke">Failed to load order trends</p>
              <button type="button" class="text-sm font-medium text-brass hover:underline" @click="loadOrderTrends()">
                Retry
              </button>
            </div>
            <svg v-else class="dashboard-line-svg" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img" :aria-label="`Orders trend for ${selectedTrendRangeLabel}`">
              <defs>
                <linearGradient id="orders-trend-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="rgb(var(--brass-rgb))" stop-opacity="0.28" />
                  <stop offset="72%" stop-color="rgb(var(--brass-rgb))" stop-opacity="0.04" />
                  <stop offset="100%" stop-color="rgb(var(--brass-rgb))" stop-opacity="0" />
                </linearGradient>
              </defs>

              <g v-for="line in trendGridLines" :key="line.y">
                <line
                  class="dashboard-line-grid"
                  :x1="chartPadding.left"
                  :x2="chartWidth - chartPadding.right"
                  :y1="line.y"
                  :y2="line.y"
                />
                <text class="dashboard-line-axis" x="0" :y="line.y + 4">{{ line.value }}</text>
              </g>

              <path v-if="hasTrendData" class="dashboard-line-area" :d="trendAreaPath" />
              <path v-if="hasTrendData" class="dashboard-line-path" :d="trendLinePath" />

              <g v-for="point in trendPoints" :key="point.date">
                <circle v-if="hasTrendData" class="dashboard-line-point" :cx="point.x" :cy="point.y" r="4" />
                <text v-if="point.showLabel" class="dashboard-line-label" :x="point.x" :y="chartHeight - 10">
                  {{ formatTrendLabel(point) }}
                </text>
              </g>

              <g v-if="!hasTrendData" class="dashboard-line-empty">
                <line
                  class="dashboard-line-empty-baseline"
                  :x1="chartPadding.left"
                  :x2="chartWidth - chartPadding.right"
                  :y1="chartHeight - chartPadding.bottom"
                  :y2="chartHeight - chartPadding.bottom"
                />
                <text :x="chartWidth / 2" :y="chartHeight / 2 - 4">No orders in this range</text>
              </g>
            </svg>
          </div>
        </div>

        <div class="grid gap-5">
          <div class="dashboard-chart-card">
            <div class="dashboard-card-heading">
              <h3 class="dashboard-chart-title">Revenue Snapshot</h3>
              <span class="dashboard-card-meta">{{ stats.revenue.paidOrders }} paid orders</span>
            </div>
            <dl class="mt-4 grid gap-3">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-sm text-smoke">Today</dt>
                <dd class="text-sm font-semibold text-ink">{{ formatMoney(stats.revenue.today) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-sm text-smoke">This month</dt>
                <dd class="text-sm font-semibold text-ink">{{ formatMoney(stats.revenue.thisMonth) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-sm text-smoke">Total confirmed</dt>
                <dd class="text-sm font-semibold text-ink">{{ formatMoney(stats.revenue.total) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-sm text-smoke">Average order value</dt>
                <dd class="text-sm font-semibold text-ink">{{ formatMoney(stats.revenue.averageOrderValue) }}</dd>
              </div>
            </dl>
          </div>

          <div class="dashboard-chart-card">
            <div class="dashboard-card-heading">
              <h3 class="dashboard-chart-title">Order Status</h3>
              <span class="dashboard-card-meta">{{ stats.orders.total }} total</span>
            </div>
            <div class="grid gap-3 mt-4">
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Pending</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-warning" :style="{ width: barWidth(stats.orders.pending, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.pending }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Confirmed</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-brass" :style="{ width: barWidth(stats.orders.confirmed, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.confirmed }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Processing</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-brass" :style="{ width: barWidth(stats.orders.processing, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.processing }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">In Transit</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-ember" :style="{ width: barWidth(stats.orders.inTransit, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.inTransit }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Delivered</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-success" :style="{ width: barWidth(stats.orders.delivered, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.delivered }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Completed</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-success" :style="{ width: barWidth(stats.orders.completed, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.completed }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Cancelled</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-danger" :style="{ width: barWidth(stats.orders.cancelled, stats.orders.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.orders.cancelled }}</span>
              </div>
            </div>
          </div>

          <div class="dashboard-chart-card">
            <div class="dashboard-card-heading">
              <h3 class="dashboard-chart-title">Payment Status</h3>
              <span class="dashboard-card-meta">{{ stats.payments.total }} total</span>
            </div>
            <div class="grid gap-3 mt-4">
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Succeeded</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-success" :style="{ width: barWidth(stats.payments.succeeded, stats.payments.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.payments.succeeded }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Pending</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-warning" :style="{ width: barWidth(stats.payments.pending, stats.payments.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.payments.pending }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Processing</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-brass" :style="{ width: barWidth(stats.payments.processing, stats.payments.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.payments.processing }}</span>
              </div>
              <div class="dashboard-bar-row">
                <span class="dashboard-bar-label">Failed</span>
                <div class="dashboard-bar-track">
                  <div class="dashboard-bar-fill bg-danger" :style="{ width: barWidth(stats.payments.failed, stats.payments.total) }" />
                </div>
                <span class="dashboard-bar-value">{{ stats.payments.failed }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!pending" class="grid gap-5 sm:grid-cols-2">
        <div class="dashboard-chart-card">
          <div class="dashboard-card-heading">
            <h3 class="dashboard-chart-title">Shipment Status</h3>
            <span class="dashboard-card-meta">{{ stats.shipments.total }} total</span>
          </div>
          <div class="grid gap-3 mt-4">
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Draft</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-smoke" :style="{ width: barWidth(stats.shipments.draft, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.draft }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Submitted</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-brass" :style="{ width: barWidth(stats.shipments.submitted, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.submitted }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Picked Up</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-brass" :style="{ width: barWidth(stats.shipments.pickedUp, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.pickedUp }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">In Transit</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-ember" :style="{ width: barWidth(stats.shipments.inTransit, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.inTransit }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Delivered</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-success" :style="{ width: barWidth(stats.shipments.delivered, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.delivered }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Returned</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-warning" :style="{ width: barWidth(stats.shipments.returned, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.returned }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Cancelled</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-danger" :style="{ width: barWidth(stats.shipments.cancelled, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.cancelled }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Failed</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-danger" :style="{ width: barWidth(stats.shipments.failed, stats.shipments.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.shipments.failed }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-chart-card">
          <div class="dashboard-card-heading">
            <h3 class="dashboard-chart-title">Product Status</h3>
            <span class="dashboard-card-meta">{{ stats.products.total }} total</span>
          </div>
          <div class="grid gap-3 mt-4">
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Published</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-success" :style="{ width: barWidth(stats.products.published, stats.products.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.products.published }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Draft</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-smoke" :style="{ width: barWidth(stats.products.draft, stats.products.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.products.draft }}</span>
            </div>
            <div class="dashboard-bar-row">
              <span class="dashboard-bar-label">Discontinued</span>
              <div class="dashboard-bar-track">
                <div class="dashboard-bar-fill bg-danger" :style="{ width: barWidth(stats.products.discontinued, stats.products.total) }" />
              </div>
              <span class="dashboard-bar-value">{{ stats.products.discontinued }}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="mb-3 text-xs font-semibold uppercase text-smoke">Manage</h2>
        <div class="dashboard-nav-grid">
          <NuxtLink v-for="card in manageCards" :key="card.to" :to="card.to" class="dashboard-nav-card group">
            <component
              :is="card.icon"
              v-if="card.icon"
              :size="28"
              weight="duotone"
              class="text-smoke transition-colors group-hover:text-ink"
            />
            <span class="dashboard-nav-title">{{ card.label }}</span>
            <span class="dashboard-nav-copy">{{ card.copy }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
