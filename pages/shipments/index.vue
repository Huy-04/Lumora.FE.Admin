<script setup lang="ts">
import { useShipmentIndexPage } from "~/features/shipments/composables/useShipmentIndexPage";
import ShipmentIndexView from "~/features/shipments/components/ShipmentIndexView.vue";

const page = await useShipmentIndexPage();
</script>

<template>
  <ShipmentIndexView :page="page" />
</template>
