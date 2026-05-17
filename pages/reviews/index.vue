<script setup lang="ts">
import { useReviewIndexPage } from "~/features/reviews/composables/useReviewIndexPage";
import ReviewIndexView from "~/features/reviews/components/ReviewIndexView.vue";

const page = await useReviewIndexPage();
</script>

<template>
  <ReviewIndexView :page="page" />
</template>
