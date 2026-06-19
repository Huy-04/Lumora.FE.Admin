<script setup lang="ts">
import { useWarehouseDetailPage } from "~/features/warehouses/composables/useWarehouseDetailPage";
import WarehouseDetailView from "~/features/warehouses/components/WarehouseDetailView.vue";

const page = await useWarehouseDetailPage();
</script>

<template>
  <WarehouseDetailView :page="page" />
</template>
