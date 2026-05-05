<script setup lang="ts">
import { useProductVariantImagePage } from "~/features/products/composables/useProductVariantImagePage";
import ProductVariantImageView from "~/features/products/components/ProductVariantImageView.vue";

const page = await useProductVariantImagePage();
</script>

<template>
  <ProductVariantImageView :page="page" />
</template>
