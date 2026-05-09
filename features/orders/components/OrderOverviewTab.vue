<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import type { OrderResponse } from "~/features/orders/types";

defineProps<{
  order: OrderResponse;
  totalQuantity: number;
}>();

const { formatDateTime } = useAuthPresentation();
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppDetailMetaPanel eyebrow="Order details">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Order number</dt>
        <dd class="text-sm font-medium text-ink">{{ order.orderNumber }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Order ID</dt>
        <dd class="break-all text-xs font-mono text-smoke">{{ order.id }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Status</dt>
        <dd class="flex flex-wrap gap-2">
          <AppBadge>{{ order.status }}</AppBadge>
          <AppBadge :tone="order.stockReservationStatus === 'Reserved' || order.stockReservationStatus === 'Committed' ? 'success' : order.stockReservationStatus === 'Failed' ? 'danger' : 'default'">
            Stock {{ order.stockReservationStatus }}
          </AppBadge>
          <AppBadge :tone="order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'danger' : 'warning'">
            Payment {{ order.paymentStatus }}
          </AppBadge>
        </dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Payment method</dt>
        <dd class="text-sm font-medium text-ink">{{ order.paymentMethod }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Warehouse ID</dt>
        <dd class="break-all text-xs font-mono text-smoke">{{ order.warehouseId }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Shipping quote ID</dt>
        <dd class="break-all text-xs font-mono text-smoke">{{ order.shippingQuoteId || "Not set" }}</dd>
      </div>
      <div v-if="order.customerNote" class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Customer note</dt>
        <dd class="text-sm text-smoke">{{ order.customerNote }}</dd>
      </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Recipient">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Name</dt>
        <dd class="text-sm font-medium text-ink">{{ order.recipientName }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Phone</dt>
        <dd class="text-sm text-smoke">{{ order.recipientPhone }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Address</dt>
        <dd class="text-sm text-smoke">
          {{ order.shippingAddress.street }}, {{ order.shippingAddress.ward }}, {{ order.shippingAddress.district }}, {{ order.shippingAddress.province }}
        </dd>
      </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Checkout totals">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Items</dt>
        <dd class="text-sm font-medium text-ink">{{ totalQuantity }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Subtotal</dt>
        <dd class="text-sm text-smoke">{{ order.subTotal.toLocaleString() }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Shipping</dt>
        <dd class="text-sm text-smoke">{{ order.shippingFee.toLocaleString() }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Discount</dt>
        <dd class="text-sm text-smoke">{{ order.discountAmount.toLocaleString() }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Total</dt>
        <dd class="text-sm font-semibold text-ink">{{ order.totalAmount.toLocaleString() }}</dd>
      </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel v-if="order.cancellation" eyebrow="Cancellation">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Reason</dt>
        <dd class="text-sm text-smoke">{{ order.cancellation.reason }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Cancelled by</dt>
        <dd class="text-sm text-smoke">{{ order.cancellation.cancelledBy }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Cancelled at</dt>
        <dd class="text-sm text-smoke">{{ formatDateTime(order.cancellation.cancelledAt) }}</dd>
      </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Audit trail">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Created at</dt>
        <dd class="text-sm text-smoke">{{ formatDateTime(order.createdAt) }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Created by</dt>
        <dd class="text-sm text-smoke">{{ order.createdBy || "System" }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Updated at</dt>
        <dd class="text-sm text-smoke">{{ formatDateTime(order.updatedAt) }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Updated by</dt>
        <dd class="text-sm text-smoke">{{ order.updatedBy || "System" }}</dd>
      </div>
    </AppDetailMetaPanel>
  </div>
</template>
