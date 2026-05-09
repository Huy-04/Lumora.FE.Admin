<script setup lang="ts">
import { useInventoryStockCreatePage } from "~/features/inventory/composables/useInventoryStockCreatePage";
import InventoryStockReorderPointView from "~/features/inventory/components/InventoryStockReorderPointView.vue";

const page = await useInventoryStockCreatePage();
</script>

<template>
  <InventoryStockReorderPointView :page="page" />
</template>
