<script setup lang="ts">
import { useOrderDetailPage } from "~/features/orders/composables/useOrderDetailPage";
import OrderDetailView from "~/features/orders/components/OrderDetailView.vue";

const page = await useOrderDetailPage();
</script>

<template>
  <OrderDetailView :page="page" />
</template>
