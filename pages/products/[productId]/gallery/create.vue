<script setup lang="ts">
import { useProductGalleryCreatePage } from "~/features/products/composables/useProductGalleryCreatePage";
import ProductGalleryCreateView from "~/features/products/components/ProductGalleryCreateView.vue";

const page = await useProductGalleryCreatePage();
</script>

<template>
  <ProductGalleryCreateView :page="page" />
</template>
