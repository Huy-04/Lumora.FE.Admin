<script setup lang="ts">
import { useSystemEventDetailPage } from "~/features/operations/composables/useSystemEventDetailPage";
import SystemEventDetailView from "~/features/operations/components/SystemEventDetailView.vue";

const page = await useSystemEventDetailPage();
</script>

<template>
  <SystemEventDetailView :page="page" />
</template>
