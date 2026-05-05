<script setup lang="ts">
import { useForgotPasswordPage } from "~/features/auth/composables/useForgotPasswordPage";
import ForgotPasswordView from "~/features/auth/components/ForgotPasswordView.vue";

definePageMeta({ layout: "auth" });

const page = await useForgotPasswordPage();
</script>

<template>
  <ForgotPasswordView :page="page" />
</template>
