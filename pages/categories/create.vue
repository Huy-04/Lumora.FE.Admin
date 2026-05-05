<script setup lang="ts">
import { useCategoryCreatePage } from "~/features/categories/composables/useCategoryCreatePage";
import CategoryCreateView from "~/features/categories/components/CategoryCreateView.vue";

const page = await useCategoryCreatePage();
</script>

<template>
  <CategoryCreateView :page="page" />
</template>
