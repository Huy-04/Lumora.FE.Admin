<script setup lang="ts">
import { useProfilePage } from "~/features/profile/composables/useProfilePage";
import ProfileView from "~/features/profile/components/ProfileView.vue";

const page = await useProfilePage();
</script>

<template>
  <ProfileView :page="page" />
</template>
