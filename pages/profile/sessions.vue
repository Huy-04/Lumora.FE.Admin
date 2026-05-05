<script setup lang="ts">
import { useProfileSessionsPage } from "~/features/profile/composables/useProfileSessionsPage";
import ProfileSessionsView from "~/features/profile/components/ProfileSessionsView.vue";

const page = await useProfileSessionsPage();
</script>

<template>
  <ProfileSessionsView :page="page" />
</template>
