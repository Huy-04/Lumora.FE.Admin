<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { OrderDetailPageState } from "~/features/orders/composables/useOrderDetailPage";

const props = defineProps<{
  page: OrderDetailPageState;
}>();

const {
  actionError,
  actionPending,
  actionReason,
  activeTab,
  availableActions,
  closeAction,
  error,
  executeAction,
  hasStockReservationFailure,
  loadErrorMessage,
  order,
  orderId,
  orderTabs,
  pending,
  requestedAction,
  requestAction,
  reasonPresets,
  selectReasonPreset,
  selectTab,
  selectedReasonPreset,
  totalQuantity,
} = props.page;

const selectOrderTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  orderTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

useScopedPageBreadcrumbs(() =>
  order.value
    ? [
        { label: "Orders", to: "/orders" },
        { label: order.value.orderNumber, to: `/orders/${orderId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="order?.orderNumber ?? ''"
    :tabs="orderTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? loadErrorMessage : null"
    error-title="Unable to load order"
    @select-tab="selectOrderTab"
  >
    <template #modals>
      <AppConfirm
        :open="requestedAction !== null && !requestedAction.requiresReason"
        :title="requestedAction ? `${requestedAction.label} order?` : ''"
        :detail="requestedAction?.detail ?? ''"
        :confirm-label="requestedAction?.label ?? 'Confirm'"
        :tone="requestedAction?.tone === 'danger' ? 'danger' : requestedAction?.tone === 'warning' ? 'warning' : 'default'"
        :loading="actionPending !== ''"
        @confirm="executeAction"
        @cancel="closeAction"
      />
      <AppConfirm
        :open="actionErrorOpen"
        title="Order action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />
    </template>

    <template v-if="order">
      <OrderOverviewTab
        v-if="activeTab === 'overview'"
        :order="order"
        :total-quantity="totalQuantity"
      />

      <div v-else-if="activeTab === 'items'" class="grid gap-4 content-start max-w-6xl">
        <OrderItemsTab :order="order" />
      </div>

      <div v-else class="grid gap-4 content-start max-w-6xl">
        <AppNotice
          v-if="hasStockReservationFailure"
          tone="danger"
          title="Stock reservation failed"
        >
          Fix inventory availability before retrying confirmation or moving this order forward.
        </AppNotice>

        <AppPanel eyebrow="Lifecycle actions">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <p class="text-sm font-semibold text-ink">Current state</p>
              <div class="flex flex-wrap gap-2">
                <AppBadge>{{ order.status }}</AppBadge>
                <AppBadge :tone="order.stockReservationStatus === 'Reserved' || order.stockReservationStatus === 'Committed' ? 'success' : order.stockReservationStatus === 'Failed' ? 'danger' : 'default'">
                  Stock {{ order.stockReservationStatus }}
                </AppBadge>
                <AppBadge :tone="order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'danger' : 'warning'">
                  Payment {{ order.paymentStatus }}
                </AppBadge>
              </div>
            </div>

            <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <AppButton
                v-for="action in availableActions"
                :key="action.key"
                :variant="action.tone === 'danger' ? 'danger' : 'secondary'"
                :loading="actionPending === action.key"
                @click="requestAction(action)"
              >
                {{ action.label }}
              </AppButton>
              <p v-if="!availableActions.length" class="self-center text-sm text-smoke">
                No lifecycle actions available.
              </p>
            </div>
          </div>
        </AppPanel>

        <AppPanel
          v-if="requestedAction?.requiresReason"
          eyebrow="Action reason"
          :title="`${requestedAction.label} order`"
          :description="requestedAction.detail"
        >
          <div class="grid gap-4">
            <div class="grid gap-3">
              <span class="app-label">Reason preset</span>
              <div class="grid gap-2 md:grid-cols-2">
                <label
                  v-for="preset in reasonPresets"
                  :key="preset.label"
                  class="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm transition hover:border-ink/30 hover:bg-surface-quiet"
                >
                  <input
                    class="mt-1"
                    type="radio"
                    name="order-reason-preset"
                    :checked="selectedReasonPreset === preset.label"
                    @change="selectReasonPreset(preset)"
                  >
                  <span>
                    <span class="block font-medium text-ink">{{ preset.label }}</span>
                    <span v-if="preset.value" class="block text-xs text-smoke">{{ preset.value }}</span>
                    <span v-else class="block text-xs text-smoke">Write a custom reason below.</span>
                  </span>
                </label>
              </div>
            </div>
            <AppTextarea v-model="actionReason" label="Reason" placeholder="Explain why this action is required" />
            <div class="flex flex-wrap justify-end gap-3">
              <AppButton variant="secondary" :disabled="actionPending !== ''" @click="closeAction">
                Keep order
              </AppButton>
              <AppButton
                :variant="requestedAction.tone === 'danger' ? 'danger' : 'primary'"
                :loading="actionPending !== ''"
                @click="executeAction"
              >
                {{ requestedAction.key === "cancel" ? "Cancel order" : requestedAction.label }}
              </AppButton>
            </div>
          </div>
        </AppPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
