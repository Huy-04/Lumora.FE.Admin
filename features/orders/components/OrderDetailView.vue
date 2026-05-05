<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { OrderDetailPageState } from "~/features/orders/composables/useOrderDetailPage";

const props = defineProps<{
  page: OrderDetailPageState;
}>();

const {
  actionError,
  actionPending,
  actionReason,
  actionSuccess,
  availableActions,
  closeAction,
  error,
  executeAction,
  loadErrorMessage,
  order,
  pending,
  refresh,
  requestedAction,
  requestAction,
  reasonPresets,
  selectReasonPreset,
  selectedReasonPreset,
  totalQuantity,
} = props.page;
</script>

<template>
  <div class="page-shell">
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

    <AppPanel
      v-if="order"
      eyebrow="Order detail"
      :title="order.orderNumber"
      description="Lifecycle actions call the Order routes, including orchestration-backed confirm, cancel, and start-processing flows."
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <AppBadge>{{ order.status }}</AppBadge>
          <AppBadge :tone="order.stockReservationStatus === 'Reserved' || order.stockReservationStatus === 'Committed' ? 'success' : order.stockReservationStatus === 'Failed' ? 'danger' : 'default'">
            Stock {{ order.stockReservationStatus }}
          </AppBadge>
          <AppBadge :tone="order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'danger' : 'warning'">
            Payment {{ order.paymentStatus }}
          </AppBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <AppButton aria-label="Reload order" icon-only variant="secondary" @click="refresh">
            <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
          </AppButton>
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

      <AppNotice v-if="actionSuccess" class="mt-6" tone="success" title="Order updated">
        {{ actionSuccess }}
      </AppNotice>
      <AppNotice v-if="actionError" class="mt-6" tone="danger" title="Order action failed">
        {{ actionError }}
      </AppNotice>
    </AppPanel>

    <AppNotice v-if="error" tone="danger" title="Unable to load order">
      {{ loadErrorMessage }}
    </AppNotice>

    <div v-if="pending" class="soft-card h-64 animate-pulse" />

    <template v-else-if="order">
      <AppPanel
        v-if="requestedAction?.requiresReason"
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
                class="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm transition hover:border-moss"
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
              Cancel
            </AppButton>
            <AppButton
              :variant="requestedAction.tone === 'danger' ? 'danger' : 'primary'"
              :loading="actionPending !== ''"
              @click="executeAction"
            >
              {{ requestedAction.label }}
            </AppButton>
          </div>
        </div>
      </AppPanel>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <AppStat label="Total" :value="order.totalAmount.toLocaleString()" detail="Order payable amount." />
        <AppStat label="Items" :value="`${totalQuantity}`" detail="Total item quantity." />
        <AppStat label="Shipping" :value="order.shippingFee.toLocaleString()" detail="Shipping fee from checkout quote." />
        <AppStat label="Payment" :value="order.paymentMethod" detail="Payment method selected at checkout." />
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AppPanel title="Order items" description="Snapshot data captured during checkout. Product edits after checkout do not change these rows.">
          <div class="table-shell overflow-x-auto">
            <table class="data-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order.items" :key="item.id">
                  <td>
                    <p class="table-title">{{ item.productNameSnapshot }}</p>
                    <p class="table-copy">{{ item.productId }}</p>
                  </td>
                  <td>{{ item.variantNameSnapshot }}</td>
                  <td>{{ item.skuSnapshot }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.priceSnapshot.toLocaleString() }}</td>
                  <td>{{ (item.priceSnapshot * item.quantity).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AppPanel>

        <div class="grid gap-6">
          <AppPanel title="Recipient" description="Shipping contact captured at checkout.">
            <div class="grid gap-3 text-sm">
              <p><span class="text-smoke">Name:</span> {{ order.recipientName }}</p>
              <p><span class="text-smoke">Phone:</span> {{ order.recipientPhone }}</p>
              <p><span class="text-smoke">Address:</span> {{ order.shippingAddress.street }}, {{ order.shippingAddress.ward }}, {{ order.shippingAddress.district }}, {{ order.shippingAddress.province }}</p>
              <p v-if="order.customerNote"><span class="text-smoke">Note:</span> {{ order.customerNote }}</p>
            </div>
          </AppPanel>

          <AppPanel title="Totals" description="Checkout monetary snapshot.">
            <div class="grid gap-3 text-sm">
              <div class="flex justify-between"><span class="text-smoke">Subtotal</span><span>{{ order.subTotal.toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-smoke">Shipping</span><span>{{ order.shippingFee.toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-smoke">Discount</span><span>{{ order.discountAmount.toLocaleString() }}</span></div>
              <div class="flex justify-between border-t border-line pt-3 text-base font-semibold"><span>Total</span><span>{{ order.totalAmount.toLocaleString() }}</span></div>
            </div>
          </AppPanel>

          <AppPanel v-if="order.cancellation" title="Cancellation" description="Stored cancellation metadata.">
            <p class="text-sm text-smoke">{{ order.cancellation.reason }}</p>
          </AppPanel>
        </div>
      </div>
    </template>
  </div>
</template>
