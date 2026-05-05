<script setup lang="ts">
import { useProductDetailPage } from "~/features/products/composables/useProductDetailPage";
import ProductDetailView from "~/features/products/components/ProductDetailView.vue";

const page = await useProductDetailPage();
</script>

<template>
  <ProductDetailView :page="page" />
</template>
