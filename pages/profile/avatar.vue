<script setup lang="ts">
import { useProfileAvatarPage } from "~/features/profile/composables/useProfileAvatarPage";
import ProfileAvatarView from "~/features/profile/components/ProfileAvatarView.vue";

const page = await useProfileAvatarPage();
</script>

<template>
  <ProfileAvatarView :page="page" />
</template>
