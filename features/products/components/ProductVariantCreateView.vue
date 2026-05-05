<script setup lang="ts">
import type { ProductVariantCreatePage } from "~/features/products/composables/useProductVariantCreatePage";

const props = defineProps<{
  page: ProductVariantCreatePage;
}>();

const { productError, productPending, product, productId, form, canUpdateProduct, canCreateVariant, pending, errorMessage, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppNotice v-if="productError" tone="danger" title="Unable to load product">
        {{ getProblemMessage(productError, "The parent product could not be loaded.") }}
      </AppNotice>

      <AppPanel
        v-else
        eyebrow="Add variant"
        title="Add variant"
        :description="product
          ? `Create a new purchasable variant for ${product.name}. Variant order is assigned automatically and can be rearranged later from the variants tab.`
          : 'Create a new purchasable variant for this product.'"
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

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput :model-value="product?.name ?? productId" label="Product" readonly />
            <AppInput v-model="form.sku" label="SKU" placeholder="LM-BDW-300" />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.name" label="Variant name" placeholder="300 ml" />
            <AppInput v-model="form.price" label="Price" inputmode="decimal" placeholder="189000" />
          </div>

          <AppInput v-model="form.compareAtPrice" label="Compare-at price" inputmode="decimal" placeholder="229000" />

          <AppNotice tone="info" title="Variant image">
            Create the variant first, then choose one representative image from the product asset library.
          </AppNotice>

          <AppNotice v-if="errorMessage" tone="danger" title="Create variant failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit" :disabled="!canCreateVariant">
              Create variant
            </AppButton>
            <NuxtLink class="secondary-link" :to="`/products/${productId}?tab=variants`">
              Back to variants
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
