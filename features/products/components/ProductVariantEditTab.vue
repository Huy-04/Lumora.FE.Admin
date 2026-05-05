<script setup lang="ts">
import type { ProductAssetResponse, ProductVariantResponse } from "~/features/products/types";

const props = defineProps<{
  productId: string;
  variant: ProductVariantResponse;
  assets: ProductAssetResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const productApi = useProductAdminApi();
const { parseOptionalNumber, parseRequiredNumber } = useNumericForm();

const form = reactive({
  sku: "",
  name: "",
  price: "",
  compareAtPrice: "",
});

const actionPending = ref(false);
const actionError = ref("");

watchEffect(() => {
  form.sku = props.variant.sku;
  form.name = props.variant.name;
  form.price = String(props.variant.price);
  form.compareAtPrice = props.variant.compareAtPrice == null ? "" : String(props.variant.compareAtPrice);
});

const saveVariant = async () => {
  actionPending.value = true;
  actionError.value = "";

  try {
    const normalizedSku = form.sku.trim().toUpperCase();

    await productApi.updateProductVariant(props.productId, props.variant.id, {
      sku: normalizedSku,
      name: form.name,
      price: parseRequiredNumber(form.price, "Price"),
      compareAtPrice: parseOptionalNumber(form.compareAtPrice, "Compare-at price"),
      productAssetId: props.variant.productAssetId ?? null,
    });

    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the variant.");
  } finally {
    actionPending.value = false;
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel title="Edit variant" description="Update SKU identity, pricing, and media without changing the parent product order.">
      <form class="form-stack" @submit.prevent="saveVariant">
        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.sku" label="SKU" />
          <AppInput v-model="form.name" label="Variant name" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.price" label="Price" inputmode="decimal" />
          <AppInput v-model="form.compareAtPrice" label="Compare-at price" inputmode="decimal" />
        </div>

        <div class="rounded-[28px] border border-line/70 bg-panel px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-panel/80">
          <label class="form-label mb-2 block">Variant image</label>
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-[22px] border border-line bg-pearl">
                <img
                  v-if="variant.img"
                  :src="variant.img"
                  alt="Variant image"
                  class="h-full w-full object-cover"
                >
                <div v-else class="grid h-full w-full place-items-center text-base font-semibold text-smoke">
                  {{ form.name?.trim()?.charAt(0)?.toUpperCase() || "?" }}
                </div>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-ink">Variant photo</p>
                <p class="mt-1 text-sm leading-6 text-smoke">
                  Open a simple page to choose one image from the product asset library.
                </p>
              </div>
            </div>
            <NuxtLink class="secondary-link whitespace-nowrap" :to="`/products/${productId}/variant-images/${variant.id}`">
              Manage image
            </NuxtLink>
          </div>
        </div>

        <AppNotice v-if="!assets.length" tone="warning" title="No product assets">
          Upload product assets from the Assets tab before selecting a variant image.
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Variant update failed">
          {{ actionError }}
        </AppNotice>

        <div class="panel-action-row border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
          <NuxtLink class="secondary-link" :to="`/products/${productId}?tab=variants`">
            Back to variants
          </NuxtLink>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
