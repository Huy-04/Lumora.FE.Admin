<script setup lang="ts">
import { useSystemEventIndexPage } from "~/features/operations/composables/useSystemEventIndexPage";
import SystemEventIndexView from "~/features/operations/components/SystemEventIndexView.vue";

const page = await useSystemEventIndexPage();
</script>

<template>
  <SystemEventIndexView :page="page" />
</template>
