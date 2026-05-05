<script setup lang="ts">
import type { ProductImageResponse } from "~/features/products/types";

const props = defineProps<{
  image: ProductImageResponse;
}>();
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel title="Image details" description="Review storefront image metadata, placement order, and whether this item is the primary storefront product image.">
      <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div class="soft-card flex items-center justify-center p-4">
          <img
            :src="image.img"
            :alt="image.alt || 'Product gallery image'"
            class="aspect-square w-full rounded-lg border border-line/60 object-cover"
          >
        </div>

        <dl class="divide-y divide-line/60">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Alt text</dt>
            <dd class="text-sm text-smoke">{{ image.alt || "Not set" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Sort order</dt>
            <dd class="text-sm text-smoke">{{ image.sortOrder }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Primary storefront image</dt>
            <dd class="text-sm text-smoke">{{ image.isPrimary ? "Yes" : "No" }}</dd>
          </div>
        </dl>
      </div>
    </AppPanel>
  </div>
</template>
