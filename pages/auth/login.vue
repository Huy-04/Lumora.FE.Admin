<script setup lang="ts">
import { useLoginPage } from "~/features/auth/composables/useLoginPage";
import LoginView from "~/features/auth/components/LoginView.vue";

definePageMeta({ layout: "auth" });

const page = await useLoginPage();
</script>

<template>
  <LoginView :page="page" />
</template>
