<script setup lang="ts">
import { useInventoryIndexPage } from "~/features/inventory/composables/useInventoryIndexPage";
import InventoryIndexView from "~/features/inventory/components/InventoryIndexView.vue";

const page = await useInventoryIndexPage();
</script>

<template>
  <InventoryIndexView :page="page" />
</template>
