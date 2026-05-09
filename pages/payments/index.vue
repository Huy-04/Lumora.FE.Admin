<script setup lang="ts">
import { usePaymentIndexPage } from "~/features/payments/composables/usePaymentIndexPage";
import PaymentIndexView from "~/features/payments/components/PaymentIndexView.vue";

const page = await usePaymentIndexPage();
</script>

<template>
  <PaymentIndexView :page="page" />
</template>
