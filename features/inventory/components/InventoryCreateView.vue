<script setup lang="ts">
import type { InventoryCreatePageState } from "~/features/inventory/composables/useInventoryCreatePage";

const props = defineProps<{
  page: InventoryCreatePageState;
}>();

const {
  form, pending, errorMessage, submit,
  productSearchPending, selectedProductId,
  variantsPending, productOptions, variantOptions,
  searchProducts, selectProduct,
} = props.page;

const manualInputOpen = ref(false);
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppPanel eyebrow="Create inventory">
        <form class="form-stack" @submit.prevent="submit">
          <!-- Step 1: Search product -->
          <AppSearchSelect
            v-model="selectedProductId"
            label="Product"
            :options="productOptions"
            :loading="productSearchPending"
            placeholder="Type product name to search"
            @search="searchProducts"
            @update:model-value="selectProduct($event)"
          />

          <!-- Step 2: Select variant -->
          <AppSearchSelect
            v-if="variantOptions.length || variantsPending"
            v-model="form.productVariantId"
            label="Variant"
            :options="variantOptions"
            :loading="variantsPending"
            placeholder="Type to search variant"
          />

          <!-- Fallback: manual input (collapsed) -->
          <div class="grid gap-2">
            <button
              type="button"
              class="text-left text-xs text-smoke hover:text-ink transition"
              @click="manualInputOpen = !manualInputOpen"
            >
              {{ manualInputOpen ? "Hide" : "Or enter variant ID manually" }}
            </button>
            <AppInput
              v-if="manualInputOpen"
              v-model="form.productVariantId"
              label="Variant ID"
              placeholder="Paste variant UUID"
            />
          </div>

          <!-- Error + Submit -->
          <AppNotice v-if="errorMessage" tone="danger" title="Create inventory failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex justify-end gap-4 border-t border-line pt-5">
            <NuxtLink class="secondary-link min-w-[9rem]" to="/inventory">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" :disabled="!form.productVariantId" class="min-w-[12rem]">
              Create inventory
            </AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
