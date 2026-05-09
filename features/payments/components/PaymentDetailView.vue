<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { PaymentDetailPageState } from "~/features/payments/composables/usePaymentDetailPage";

const props = defineProps<{
  page: PaymentDetailPageState;
}>();

const {
  actionError,
  actionPending,
  activeTab,
  availableActions,
  closeAction,
  error,
  executeAction,
  loadErrorMessage,
  payment,
  paymentId,
  paymentTabs,
  pending,
  requestedAction,
  requestAction,
  selectTab,
} = props.page;

const { formatDateTime } = useAuthPresentation();

const selectPaymentTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  paymentTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

const statusTone = (status: string) => {
  if (status === "Succeeded") return "success";
  if (status === "Failed") return "danger";
  if (status === "Pending" || status === "Processing") return "warning";
  return "default";
};

useScopedPageBreadcrumbs(() =>
  payment.value
    ? [
        { label: "Payments", to: "/payments" },
        { label: payment.value.orderNumber || paymentId.value, to: `/payments/${paymentId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="payment?.orderNumber ?? ''"
    :tabs="paymentTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? loadErrorMessage : null"
    error-title="Unable to load payment"
    @select-tab="selectPaymentTab"
  >
    <template #modals>
      <AppConfirm
        :open="requestedAction !== null"
        :title="requestedAction ? `${requestedAction.label}?` : ''"
        :detail="requestedAction?.detail ?? ''"
        :confirm-label="requestedAction?.label ?? 'Confirm'"
        :tone="requestedAction?.tone === 'danger' ? 'danger' : requestedAction?.tone === 'warning' ? 'warning' : 'default'"
        :loading="actionPending !== ''"
        @confirm="executeAction"
        @cancel="closeAction"
      />
      <AppConfirm
        :open="actionErrorOpen"
        title="Payment action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />
    </template>

    <template v-if="payment">
      <div v-if="activeTab === 'overview'" class="grid gap-6 content-start max-w-6xl">
        <AppDetailMetaPanel eyebrow="Payment details">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Payment ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ payment.id }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Order</dt>
            <dd class="text-sm font-medium text-ink">{{ payment.orderNumber }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Order ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ payment.orderId }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">User ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ payment.userId }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Status</dt>
            <dd><AppBadge :tone="statusTone(payment.status)">{{ payment.status }}</AppBadge></dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Method</dt>
            <dd class="text-sm text-smoke">{{ payment.method }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Provider</dt>
            <dd class="text-sm text-smoke">{{ payment.provider }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Amount</dt>
            <dd class="text-sm font-semibold text-ink">{{ payment.amount.toLocaleString() }} {{ payment.currency }}</dd>
          </div>
          <div v-if="payment.succeededAt" class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Succeeded at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(payment.succeededAt) }}</dd>
          </div>
          <div v-if="payment.failedAt" class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Failed at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(payment.failedAt) }}</dd>
          </div>
          <div v-if="payment.failureCode || payment.failureMessage" class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Failure</dt>
            <dd class="text-sm text-smoke">{{ payment.failureMessage || payment.failureCode }}</dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel eyebrow="Audit trail">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(payment.createdAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created by</dt>
            <dd class="text-sm text-smoke">{{ payment.createdBy || "System" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(payment.updatedAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated by</dt>
            <dd class="text-sm text-smoke">{{ payment.updatedBy || "System" }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>

      <div v-else-if="activeTab === 'attempts'" class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="Provider attempts">
          <div v-if="payment.attempts.length" class="table-shell overflow-x-auto">
            <table class="data-table min-w-[1180px]">
              <thead>
                <tr>
                  <th>Attempt</th>
                  <th>Status</th>
                  <th>Txn ref</th>
                  <th>Provider transaction</th>
                  <th>Amount</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th>Provider response</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attempt in payment.attempts" :key="attempt.id">
                  <td>{{ attempt.attemptNo }}</td>
                  <td><AppBadge :tone="statusTone(attempt.status)">{{ attempt.status }}</AppBadge></td>
                  <td class="break-all">{{ attempt.txnRef }}</td>
                  <td>{{ attempt.providerTransactionNo || "None" }}</td>
                  <td>{{ attempt.amount.toLocaleString() }}</td>
                  <td>{{ formatDateTime(attempt.issuedAt) }}</td>
                  <td>{{ formatDateTime(attempt.expiresAt) }}</td>
                  <td>{{ attempt.providerResponseCode || attempt.failureMessage || "None" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <AppEmptyState
            v-else
            title="No provider attempts"
            detail="COD/manual payments may not have provider attempt records."
          />
        </AppPanel>
      </div>

      <div v-else class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="Manual payment operations">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <p class="max-w-2xl text-sm text-smoke">
              Manual actions are admin fallbacks for COD or provider-reconciled payments. They update the payment aggregate and the related order payment state.
            </p>
            <div class="flex flex-wrap justify-end gap-2">
              <AppButton
                v-for="action in availableActions"
                :key="action.key"
                :variant="action.tone === 'danger' ? 'danger' : 'secondary'"
                :loading="actionPending === action.key"
                @click="requestAction(action)"
              >
                {{ action.label }}
              </AppButton>
            </div>
          </div>
        </AppPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
