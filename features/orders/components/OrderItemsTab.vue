<script setup lang="ts">
import type { OrderResponse } from "~/features/orders/types";

defineProps<{
  order: OrderResponse;
}>();
</script>

<template>
  <div class="grid gap-6 content-start">
    <AppPanel eyebrow="Order items">
      <div v-if="order.items.length" class="table-shell overflow-x-auto">
        <table class="data-table min-w-[860px]">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Weight</th>
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
              <td>{{ item.weightSnapshot.toLocaleString() }}</td>
              <td>{{ (item.priceSnapshot * item.quantity).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="grid place-items-center gap-2 py-12 text-center">
        <p class="app-empty-state-kicker">No records</p>
        <h3 class="app-empty-state-title">No order items</h3>
        <p class="app-empty-state-detail">This order does not have item snapshots.</p>
      </div>
    </AppPanel>
  </div>
</template>
