<script setup lang="ts">
import { useWarehouseIndexPage } from "~/features/warehouses/composables/useWarehouseIndexPage";
import WarehouseIndexView from "~/features/warehouses/components/WarehouseIndexView.vue";



const page = await useWarehouseIndexPage();
</script>

<template>
  <WarehouseIndexView :page="page" />
</template>
