<script setup lang="ts">
import { useProductVariantDetailPage } from "~/features/products/composables/useProductVariantDetailPage";
import ProductVariantDetailView from "~/features/products/components/ProductVariantDetailView.vue";

const page = await useProductVariantDetailPage();
</script>

<template>
  <ProductVariantDetailView :page="page" />
</template>
