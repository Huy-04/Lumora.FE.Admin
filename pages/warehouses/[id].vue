<script setup lang="ts">
import { useWarehouseDetailPage } from "~/features/inventory/composables/useWarehouseDetailPage";
import WarehouseDetailView from "~/features/inventory/components/WarehouseDetailView.vue";

const page = await useWarehouseDetailPage();
</script>

<template>
  <WarehouseDetailView :page="page" />
</template>
