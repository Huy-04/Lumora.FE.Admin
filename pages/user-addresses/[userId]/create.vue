<script setup lang="ts">
import { useUserAddressCreatePage } from "~/features/users/composables/useUserAddressCreatePage";
import UserAddressCreateView from "~/features/users/components/UserAddressCreateView.vue";

const page = await useUserAddressCreatePage();
</script>

<template>
  <UserAddressCreateView :page="page" />
</template>
