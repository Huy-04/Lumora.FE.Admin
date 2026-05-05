<script setup lang="ts">
import { useUserAddressEditPage } from "~/features/users/composables/useUserAddressEditPage";
import UserAddressEditView from "~/features/users/components/UserAddressEditView.vue";

const page = await useUserAddressEditPage();
</script>

<template>
  <UserAddressEditView :page="page" />
</template>
