<script setup lang="ts">
import { useRoleDetailPage } from "~/features/roles/composables/useRoleDetailPage";
import RoleDetailView from "~/features/roles/components/RoleDetailView.vue";

const page = await useRoleDetailPage();
</script>

<template>
  <RoleDetailView :page="page" />
</template>
