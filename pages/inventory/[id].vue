<script setup lang="ts">
import { useInventoryDetailPage } from "~/features/inventory/composables/useInventoryDetailPage";
import InventoryDetailView from "~/features/inventory/components/InventoryDetailView.vue";

const page = await useInventoryDetailPage();
</script>

<template>
  <InventoryDetailView :page="page" />
</template>
