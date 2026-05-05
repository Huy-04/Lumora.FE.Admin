<script setup lang="ts">
import { useResetPasswordPage } from "~/features/auth/composables/useResetPasswordPage";
import ResetPasswordView from "~/features/auth/components/ResetPasswordView.vue";

definePageMeta({ layout: "auth" });

const page = await useResetPasswordPage();
</script>

<template>
  <ResetPasswordView :page="page" />
</template>
