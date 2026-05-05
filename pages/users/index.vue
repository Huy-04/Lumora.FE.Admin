<script setup lang="ts">
import { useUsersIndexPage } from "~/features/users/composables/useUsersIndexPage";
import UsersIndexView from "~/features/users/components/UsersIndexView.vue";

const page = await useUsersIndexPage();
</script>

<template>
  <UsersIndexView :page="page" />
</template>
