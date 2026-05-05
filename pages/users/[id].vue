<script setup lang="ts">
import { useUserDetailPage } from "~/features/users/composables/useUserDetailPage";
import UserDetailView from "~/features/users/components/UserDetailView.vue";

const page = await useUserDetailPage();
</script>

<template>
  <UserDetailView :page="page" />
</template>
