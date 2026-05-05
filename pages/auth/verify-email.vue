<script setup lang="ts">
import { useEmailVerificationPage } from "~/features/auth/composables/useEmailVerificationPage";
import EmailVerificationView from "~/features/auth/components/EmailVerificationView.vue";

definePageMeta({ layout: "auth" });

const page = await useEmailVerificationPage();
</script>

<template>
  <EmailVerificationView :page="page" />
</template>
