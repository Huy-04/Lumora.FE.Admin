<script setup lang="ts">
import { useWarehouseCreatePage } from "~/features/warehouses/composables/useWarehouseCreatePage";
import WarehouseCreateView from "~/features/warehouses/components/WarehouseCreateView.vue";

const page = await useWarehouseCreatePage();
</script>

<template>
  <WarehouseCreateView :page="page" />
</template>
