<script setup lang="ts">
import { useAccessDeniedPage } from "~/features/auth/composables/useAccessDeniedPage";
import AccessDeniedView from "~/features/auth/components/AccessDeniedView.vue";

definePageMeta({ layout: "auth" });

const page = useAccessDeniedPage();
</script>

<template>
  <AccessDeniedView :page="page" />
</template>
