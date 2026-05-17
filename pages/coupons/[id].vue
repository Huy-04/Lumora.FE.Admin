<script setup lang="ts">
import { useCouponDetailPage } from "~/features/coupons/composables/useCouponDetailPage";
import CouponDetailView from "~/features/coupons/components/CouponDetailView.vue";

const page = await useCouponDetailPage();
</script>

<template>
  <CouponDetailView :page="page" />
</template>
