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
const { parseOptionalNumber, parseRequiredInt, parseRequiredNumber } = useNumericForm();

const form = reactive({
  sku: "",
  name: "",
  price: "",
  compareAtPrice: "",
  weight: "",
  length: "",
  width: "",
  height: "",
});

const actionPending = ref(false);
const actionError = ref("");

watchEffect(() => {
  form.sku = props.variant.sku;
  form.name = props.variant.name;
  form.price = String(props.variant.price);
  form.compareAtPrice = props.variant.compareAtPrice == null ? "" : String(props.variant.compareAtPrice);
  form.weight = String(props.variant.weight);
  form.length = String(props.variant.length);
  form.width = String(props.variant.width);
  form.height = String(props.variant.height);
});

const parsePositiveInt = (value: string, label: string) => {
  const parsed = parseRequiredInt(value, label);
  if (parsed <= 0) {
    throw new Error(`${label} must be greater than 0.`);
  }

  return parsed;
};

const saveVariant = async () => {
  actionPending.value = true;
  actionError.value = "";

  try {
    const skuValidationMessage = getProductSkuValidationMessage(form.sku);
    if (skuValidationMessage) {
      throw new Error(skuValidationMessage);
    }

    await productApi.updateProductVariant(props.productId, props.variant.id, {
      sku: form.sku,
      name: form.name,
      price: parseRequiredNumber(form.price, "Price"),
      weight: parsePositiveInt(form.weight, "Weight"),
      length: parsePositiveInt(form.length, "Length"),
      width: parsePositiveInt(form.width, "Width"),
      height: parsePositiveInt(form.height, "Height"),
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
    <AppPanel eyebrow="Edit variant">
      <form class="form-stack" @submit.prevent="saveVariant">
        <div class="border-y border-line/70 py-4">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-[20px] border border-line bg-pearl">
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
                <p class="meta-label">Variant image</p>
                <p class="mt-1 text-sm font-medium text-ink">{{ variant.img ? "Image selected" : "No image selected" }}</p>
              </div>
            </div>
            <NuxtLink class="secondary-link whitespace-nowrap" :to="`/products/${productId}/variant-images/${variant.id}`">
              Manage image
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.sku" label="SKU" />
          <AppInput v-model="form.name" label="Variant name" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.price" label="Price" inputmode="decimal" />
          <AppInput v-model="form.compareAtPrice" label="Compare-at price" inputmode="decimal" />
        </div>

        <div class="grid gap-4 border-t border-line/70 pt-4">
          <div class="flex items-center gap-4">
            <span class="h-px w-16 bg-line" />
            <span class="meta-label">Package</span>
          </div>
          <div class="grid gap-4 md:grid-cols-4">
            <AppInput v-model="form.weight" label="Weight" inputmode="numeric" />
            <AppInput v-model="form.length" label="Length" inputmode="numeric" />
            <AppInput v-model="form.width" label="Width" inputmode="numeric" />
            <AppInput v-model="form.height" label="Height" inputmode="numeric" />
          </div>
        </div>

        <AppNotice v-if="!assets.length" tone="warning" title="No product assets">
          Upload product assets from the Assets tab before selecting a variant image.
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Variant update failed">
          {{ actionError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
