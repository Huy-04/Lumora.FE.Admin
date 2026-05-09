<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import type { InventoryResponse } from "~/features/inventory/types";

defineProps<{
  inventory: InventoryResponse;
}>();

const { formatDateTime } = useAuthPresentation();
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppDetailMetaPanel eyebrow="Inventory details">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">SKU</dt>
        <dd class="text-sm font-medium text-ink">{{ inventory.sku }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Inventory ID</dt>
        <dd class="break-all text-xs font-mono text-smoke">{{ inventory.id }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Product ID</dt>
        <dd class="break-all text-xs font-mono text-smoke">{{ inventory.productId }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Variant ID</dt>
        <dd class="break-all text-xs font-mono text-smoke">{{ inventory.productVariantId }}</dd>
      </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Stock summary">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Total</dt>
        <dd class="text-sm font-medium text-ink">{{ inventory.totalQuantity }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Available</dt>
        <dd class="text-sm text-smoke">{{ inventory.totalAvailableQuantity }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Reserved</dt>
        <dd class="text-sm text-smoke">{{ inventory.totalReservedQuantity }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Stock rows</dt>
        <dd class="text-sm text-smoke">{{ inventory.stocks.length }}</dd>
      </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Audit trail">
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Created at</dt>
        <dd class="text-sm text-smoke">{{ formatDateTime(inventory.createdAt) }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Created by</dt>
        <dd class="text-sm text-smoke">{{ inventory.createdBy || "System" }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Updated at</dt>
        <dd class="text-sm text-smoke">{{ formatDateTime(inventory.updatedAt) }}</dd>
      </div>
      <div class="flex items-baseline gap-4 py-3">
        <dt class="meta-label w-40 shrink-0">Updated by</dt>
        <dd class="text-sm text-smoke">{{ inventory.updatedBy || "System" }}</dd>
      </div>
    </AppDetailMetaPanel>
  </div>
</template>
