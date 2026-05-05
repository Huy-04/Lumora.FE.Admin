<script setup lang="ts">
import { useProductVariantCreatePage } from "~/features/products/composables/useProductVariantCreatePage";
import ProductVariantCreateView from "~/features/products/components/ProductVariantCreateView.vue";

const page = await useProductVariantCreatePage();
</script>

<template>
  <ProductVariantCreateView :page="page" />
</template>
