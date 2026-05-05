<script setup lang="ts">
import { useSessionsIndexPage } from "~/features/sessions/composables/useSessionsIndexPage";
import SessionsIndexView from "~/features/sessions/components/SessionsIndexView.vue";

const page = await useSessionsIndexPage();
</script>

<template>
  <SessionsIndexView :page="page" />
</template>
