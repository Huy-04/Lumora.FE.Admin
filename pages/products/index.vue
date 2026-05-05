<script setup lang="ts">
import { useProductIndexPage } from "~/features/products/composables/useProductIndexPage";
import ProductIndexView from "~/features/products/components/ProductIndexView.vue";

const page = await useProductIndexPage();
</script>

<template>
  <ProductIndexView :page="page" />
</template>
