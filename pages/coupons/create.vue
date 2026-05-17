<script setup lang="ts">
import { useCouponCreatePage } from "~/features/coupons/composables/useCouponCreatePage";
import CouponCreateView from "~/features/coupons/components/CouponCreateView.vue";

const page = await useCouponCreatePage();
</script>

<template>
  <CouponCreateView :page="page" />
</template>
