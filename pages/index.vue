<script setup lang="ts">
import { useDashboardPage } from "~/features/dashboard/composables/useDashboardPage";
import DashboardView from "~/features/dashboard/components/DashboardView.vue";

const page = await useDashboardPage();
</script>

<template>
  <DashboardView :page="page" />
</template>
