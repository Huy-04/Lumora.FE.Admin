<script setup lang="ts">
import { usePermissionCreatePage } from "~/features/permissions/composables/usePermissionCreatePage";
import PermissionCreateView from "~/features/permissions/components/PermissionCreateView.vue";

const page = await usePermissionCreatePage();
</script>

<template>
  <PermissionCreateView :page="page" />
</template>
