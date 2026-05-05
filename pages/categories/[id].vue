<script setup lang="ts">
import { useCategoryDetailPage } from "~/features/categories/composables/useCategoryDetailPage";
import CategoryDetailView from "~/features/categories/components/CategoryDetailView.vue";

const page = await useCategoryDetailPage();
</script>

<template>
  <CategoryDetailView :page="page" />
</template>
