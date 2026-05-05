<script setup lang="ts">
import { useRolesIndexPage } from "~/features/roles/composables/useRolesIndexPage";
import RolesIndexView from "~/features/roles/components/RolesIndexView.vue";

const page = await useRolesIndexPage();
</script>

<template>
  <RolesIndexView :page="page" />
</template>
