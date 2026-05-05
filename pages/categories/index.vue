<script setup lang="ts">
import { useCategoryIndexPage } from "~/features/categories/composables/useCategoryIndexPage";
import CategoryIndexView from "~/features/categories/components/CategoryIndexView.vue";

const page = await useCategoryIndexPage();
</script>

<template>
  <CategoryIndexView :page="page" />
</template>
