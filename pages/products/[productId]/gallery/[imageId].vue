<script setup lang="ts">
import { useProductGalleryDetailPage } from "~/features/products/composables/useProductGalleryDetailPage";
import ProductGalleryDetailView from "~/features/products/components/ProductGalleryDetailView.vue";

const page = await useProductGalleryDetailPage();
</script>

<template>
  <ProductGalleryDetailView :page="page" />
</template>
