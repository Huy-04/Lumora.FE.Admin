<script setup lang="ts">
import { usePermissionDetailPage } from "~/features/permissions/composables/usePermissionDetailPage";
import PermissionDetailView from "~/features/permissions/components/PermissionDetailView.vue";

const page = await usePermissionDetailPage();
</script>

<template>
  <PermissionDetailView :page="page" />
</template>
