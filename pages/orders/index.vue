<script setup lang="ts">
import { useOrderIndexPage } from "~/features/orders/composables/useOrderIndexPage";
import OrderIndexView from "~/features/orders/components/OrderIndexView.vue";

const page = await useOrderIndexPage();
</script>

<template>
  <OrderIndexView :page="page" />
</template>
