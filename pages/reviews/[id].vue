<script setup lang="ts">
import { useReviewDetailPage } from "~/features/reviews/composables/useReviewDetailPage";
import ReviewDetailView from "~/features/reviews/components/ReviewDetailView.vue";

const page = await useReviewDetailPage();
</script>

<template>
  <ReviewDetailView :page="page" />
</template>
