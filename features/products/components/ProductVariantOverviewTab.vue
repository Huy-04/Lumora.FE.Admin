<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import type { ProductVariantResponse } from "~/features/products/types";

const props = defineProps<{
  variant: ProductVariantResponse;
}>();

const compareAtPriceLabel = computed(() =>
  props.variant.compareAtPrice == null ? "Not set" : `${props.variant.compareAtPrice}`,
);
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppDetailMetaPanel eyebrow="Variant details">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Name</dt>
          <dd class="text-sm font-medium text-ink">{{ variant.name }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">SKU</dt>
          <dd class="break-all text-sm text-smoke">{{ variant.sku }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Status</dt>
          <dd class="text-sm text-smoke">{{ variant.status }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Default</dt>
          <dd class="text-sm text-smoke">{{ variant.isDefault ? "Yes" : "No" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Sort order</dt>
          <dd class="text-sm text-smoke">{{ variant.sortOrder }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Image URL</dt>
          <dd class="break-all text-sm text-smoke">{{ variant.img || "Not set" }}</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Pricing">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Price</dt>
          <dd class="text-sm font-medium text-ink">{{ variant.price }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Compare-at price</dt>
          <dd class="text-sm text-smoke">{{ compareAtPriceLabel }}</dd>
        </div>
    </AppDetailMetaPanel>
  </div>
</template>
