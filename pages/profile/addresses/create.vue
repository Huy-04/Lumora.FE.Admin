<script setup lang="ts">
import ProfileAddressCreateView from "~/features/profile/components/ProfileAddressCreateView.vue";
import { useProfileAddressCreatePage } from "~/features/profile/composables/useProfileAddressCreatePage";

const page = await useProfileAddressCreatePage();
</script>

<template>
  <ProfileAddressCreateView :page="page" />
</template>
