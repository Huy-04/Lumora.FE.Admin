<script setup lang="ts">
import { useRoleCreatePage } from "~/features/roles/composables/useRoleCreatePage";
import RoleCreateView from "~/features/roles/components/RoleCreateView.vue";

const page = await useRoleCreatePage();
</script>

<template>
  <RoleCreateView :page="page" />
</template>
