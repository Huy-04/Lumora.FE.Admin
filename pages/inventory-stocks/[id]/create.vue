<script setup lang="ts">
import { useInventoryStockCreatePage } from "~/features/inventory/composables/useInventoryStockCreatePage";
import InventoryStockCreateView from "~/features/inventory/components/InventoryStockCreateView.vue";

const page = await useInventoryStockCreatePage();
</script>

<template>
  <InventoryStockCreateView :page="page" />
</template>
