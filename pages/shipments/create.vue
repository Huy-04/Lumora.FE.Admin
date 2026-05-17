<script setup lang="ts">
import { useShipmentCreatePage } from "~/features/shipments/composables/useShipmentCreatePage";
import ShipmentCreateView from "~/features/shipments/components/ShipmentCreateView.vue";

const page = await useShipmentCreatePage();
</script>

<template>
  <ShipmentCreateView :page="page" />
</template>
