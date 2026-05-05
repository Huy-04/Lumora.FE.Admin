<script setup lang="ts">
import { useShipmentDetailPage } from "~/features/shipments/composables/useShipmentDetailPage";
import ShipmentDetailView from "~/features/shipments/components/ShipmentDetailView.vue";

const page = await useShipmentDetailPage();
</script>

<template>
  <ShipmentDetailView :page="page" />
</template>
