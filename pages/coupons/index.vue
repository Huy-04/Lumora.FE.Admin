<script setup lang="ts">
import { useCouponIndexPage } from "~/features/coupons/composables/useCouponIndexPage";
import CouponIndexView from "~/features/coupons/components/CouponIndexView.vue";

const page = await useCouponIndexPage();
</script>

<template>
  <CouponIndexView :page="page" />
</template>
