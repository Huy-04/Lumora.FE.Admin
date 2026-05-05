<script setup lang="ts">
import { usePermissionsIndexPage } from "~/features/permissions/composables/usePermissionsIndexPage";
import PermissionsIndexView from "~/features/permissions/components/PermissionsIndexView.vue";

const page = await usePermissionsIndexPage();
</script>

<template>
  <PermissionsIndexView :page="page" />
</template>
