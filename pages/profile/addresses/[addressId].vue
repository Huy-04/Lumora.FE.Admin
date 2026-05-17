<script setup lang="ts">
import ProfileAddressEditView from "~/features/profile/components/ProfileAddressEditView.vue";
import { useProfileAddressEditPage } from "~/features/profile/composables/useProfileAddressEditPage";

const page = await useProfileAddressEditPage();
</script>

<template>
  <ProfileAddressEditView :page="page" />
</template>
