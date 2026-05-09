<script setup lang="ts">
import { usePaymentDetailPage } from "~/features/payments/composables/usePaymentDetailPage";
import PaymentDetailView from "~/features/payments/components/PaymentDetailView.vue";

const page = await usePaymentDetailPage();
</script>

<template>
  <PaymentDetailView :page="page" />
</template>
