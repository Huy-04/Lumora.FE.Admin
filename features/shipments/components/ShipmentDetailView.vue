<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ShipmentDetailPageState } from "~/features/shipments/composables/useShipmentDetailPage";

const props = defineProps<{
  page: ShipmentDetailPageState;
}>();

const {
  actionError,
  actionPending,
  activeTab,
  canSubmitShipment,
  error,
  isDraft,
  loadErrorMessage,
  pending,
  selectTab,
  shipment,
  shipmentId,
  shipmentTabs,
  submitShipment,
} = props.page;

const { formatDateTime } = useAuthPresentation();

const selectShipmentTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  shipmentTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() =>
  shipment.value
    ? [
        { label: "Shipments", to: "/shipments" },
        { label: shipment.value.shipmentNumber, to: `/shipments/${shipmentId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};
</script>

<template>
  <AppDetailPage
    :title="shipment?.shipmentNumber ?? ''"
    :tabs="shipmentTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? loadErrorMessage : null"
    error-title="Unable to load shipment"
    @select-tab="selectShipmentTab"
  >
    <template #modals>
      <AppConfirm
        :open="actionErrorOpen"
        title="Shipment action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />
    </template>

    <template v-if="shipment">
      <div v-if="activeTab === 'overview'" class="grid gap-6 content-start max-w-6xl">
        <AppDetailMetaPanel eyebrow="Shipment details">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Shipment number</dt>
            <dd class="text-sm font-medium text-ink">{{ shipment.shipmentNumber }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Shipment ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ shipment.id }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Order number</dt>
            <dd class="text-sm font-medium text-ink">{{ shipment.orderNumber }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Order ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ shipment.orderId }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Status</dt>
            <dd>
              <AppBadge :tone="shipment.status === 'Delivered' ? 'success' : shipment.status === 'Cancelled' || shipment.status === 'Failed' || shipment.status === 'Returned' ? 'danger' : shipment.status === 'Draft' ? 'warning' : 'default'">
                {{ shipment.status }}
              </AppBadge>
            </dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Carrier</dt>
            <dd class="text-sm text-smoke">{{ shipment.carrier }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Carrier order</dt>
            <dd class="text-sm text-smoke">{{ shipment.carrierOrderCode ?? "Not submitted" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Carrier shop ID</dt>
            <dd class="text-sm text-smoke">{{ shipment.carrierShopId ?? "Not submitted" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Submitted</dt>
            <dd class="text-sm text-smoke">{{ shipment.submittedAt ? formatDateTime(shipment.submittedAt) : "Pending" }}</dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel eyebrow="Audit trail">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(shipment.createdAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created by</dt>
            <dd class="text-sm text-smoke">{{ shipment.createdBy || "System" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(shipment.updatedAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated by</dt>
            <dd class="text-sm text-smoke">{{ shipment.updatedBy || "System" }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>

      <div v-else-if="activeTab === 'tracking'" class="grid gap-6 content-start max-w-6xl">
        <AppPanel v-if="canSubmitShipment && isDraft" eyebrow="Carrier handoff">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <AppBadge tone="warning">{{ shipment.status }}</AppBadge>
              <AppBadge>{{ shipment.carrier }}</AppBadge>
              <span class="text-sm text-smoke">Carrier submission pending</span>
            </div>
            <AppButton :loading="actionPending === 'submit'" variant="secondary" @click="submitShipment">
              Retry submit
            </AppButton>
          </div>
        </AppPanel>

        <AppDetailMetaPanel eyebrow="Carrier timeline">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Carrier order</dt>
            <dd class="text-sm text-smoke">{{ shipment.carrierOrderCode ?? "Not submitted" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Carrier shop ID</dt>
            <dd class="text-sm text-smoke">{{ shipment.carrierShopId ?? "Not submitted" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Submitted</dt>
            <dd class="text-sm text-smoke">{{ shipment.submittedAt ? formatDateTime(shipment.submittedAt) : "Pending" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Picked</dt>
            <dd class="text-sm text-smoke">{{ shipment.pickedAt ? formatDateTime(shipment.pickedAt) : "Pending" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Delivered</dt>
            <dd class="text-sm text-smoke">{{ shipment.deliveredAt ? formatDateTime(shipment.deliveredAt) : "Pending" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Returned</dt>
            <dd class="text-sm text-smoke">{{ shipment.returnedAt ? formatDateTime(shipment.returnedAt) : "Pending" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Cancelled</dt>
            <dd class="text-sm text-smoke">{{ shipment.cancelledAt ? formatDateTime(shipment.cancelledAt) : "Pending" }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>

      <div v-else class="grid gap-6 content-start max-w-6xl">
        <AppDetailMetaPanel v-if="shipment.cancellation" eyebrow="Cancellation">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Reason</dt>
            <dd class="text-sm text-smoke">{{ shipment.cancellation.reason }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Cancelled by</dt>
            <dd class="text-sm text-smoke">{{ shipment.cancellation.cancelledBy }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Cancelled at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(shipment.cancellation.cancelledAt) }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
