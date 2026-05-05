<script setup lang="ts">
import { useProductCreatePage } from "~/features/products/composables/useProductCreatePage";
import ProductCreateView from "~/features/products/components/ProductCreateView.vue";

const page = await useProductCreatePage();
</script>

<template>
  <ProductCreateView :page="page" />
</template>
