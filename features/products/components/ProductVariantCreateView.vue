<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProductVariantCreatePage } from "~/features/products/composables/useProductVariantCreatePage";

const props = defineProps<{
  page: ProductVariantCreatePage;
}>();

const { productError, productPending, product, productId, form, canUpdateProduct, canCreateVariant, pending, errorMessage, submit } = props.page;

useScopedPageBreadcrumbs(() =>
  product.value
      ? [
          { label: "Products", to: "/products" },
          { label: product.value.name, to: `/products/${productId.value}` },
          { label: "Variants", to: `/products/${productId.value}?tab=variants` },
          { label: "Add variant" },
        ]
    : [],
);
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppNotice v-if="productError" tone="danger" title="Unable to load product">
        {{ getProblemMessage(productError, "The parent product could not be loaded.") }}
      </AppNotice>

      <AppPanel
        v-else
        eyebrow="Add variant"
      >
        <template v-if="productPending">
          <div class="grid gap-4">
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
            <div class="soft-card h-12 animate-pulse" />
          </div>
        </template>

        <form v-else class="form-stack" @submit.prevent="submit">
          <AppNotice v-if="!canUpdateProduct" tone="warning" title="Read-only access">
            Product update permission is required to add variants.
          </AppNotice>

          <AppNotice v-else-if="product?.isDeleted" tone="warning" title="Variant creation unavailable">
            Restore this product before adding new variants.
          </AppNotice>

          <div class="border-y border-line/70 py-4">
            <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span class="meta-label w-40 shrink-0">Product</span>
              <span class="text-sm font-medium text-ink">{{ product?.name ?? productId }}</span>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.sku" label="SKU" placeholder="LM-BDW-300" />
            <AppInput v-model="form.name" label="Variant name" placeholder="300 ml" />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.price" label="Price" inputmode="decimal" placeholder="189000" />
            <AppInput v-model="form.compareAtPrice" label="Compare-at price" inputmode="decimal" placeholder="229000" />
          </div>

          <div class="grid gap-4 border-t border-line/70 pt-4">
            <div class="flex items-center gap-4">
              <span class="h-px w-16 bg-line" />
              <span class="meta-label">Package</span>
            </div>
            <div class="grid gap-4 md:grid-cols-4">
              <AppInput v-model="form.weight" label="Weight" inputmode="numeric" placeholder="300" />
              <AppInput v-model="form.length" label="Length" inputmode="numeric" placeholder="10" />
              <AppInput v-model="form.width" label="Width" inputmode="numeric" placeholder="6" />
              <AppInput v-model="form.height" label="Height" inputmode="numeric" placeholder="16" />
            </div>
          </div>

          <AppNotice v-if="errorMessage" tone="danger" title="Create variant failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex flex-wrap items-center justify-end gap-4 border-t border-line/70 pt-4">
            <NuxtLink class="secondary-link min-w-[9rem]" :to="`/products/${productId}?tab=variants`">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" :disabled="!canCreateVariant" class="min-w-[12rem]">
              Create variant
            </AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
