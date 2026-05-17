<script setup lang="ts">
import { useInventoryCreatePage } from "~/features/inventory/composables/useInventoryCreatePage";
import InventoryCreateView from "~/features/inventory/components/InventoryCreateView.vue";

const page = await useInventoryCreatePage();
</script>

<template>
  <InventoryCreateView :page="page" />
</template>
