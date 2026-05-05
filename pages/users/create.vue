<script setup lang="ts">
import { useUserCreatePage } from "~/features/users/composables/useUserCreatePage";
import UserCreateView from "~/features/users/components/UserCreateView.vue";

const page = await useUserCreatePage();
</script>

<template>
  <UserCreateView :page="page" />
</template>
