<script setup lang="ts">
import type { ProductAssetResponse, ProductImageResponse } from "~/features/products/types/products";

const props = defineProps<{
  productId: string;
  image: ProductImageResponse;
  assets: ProductAssetResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const productApi = useProductAdminApi();

const form = reactive({
  assetId: "",
  alt: "",
});

const actionPending = ref<"" | "save" | "primary">("");
const actionError = ref("");

watchEffect(() => {
  form.alt = props.image.alt || "";
  form.assetId = props.assets.find((asset) => asset.img === props.image.img)?.id || "";
});

const selectAsset = (asset: ProductAssetResponse) => {
  form.assetId = asset.id;
  actionError.value = "";
};

const saveImage = async () => {
  if (!form.assetId) {
    return;
  }

  actionPending.value = "save";
  actionError.value = "";

  try {
    await productApi.updateProductImage(props.productId, props.image.id, {
      assetId: form.assetId,
      alt: form.alt || null,
    });

    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the gallery image.");
  } finally {
    actionPending.value = "";
  }
};

const setPrimary = async () => {
  if (props.image.isPrimary) {
    return;
  }

  actionPending.value = "primary";
  actionError.value = "";

  try {
    await productApi.setPrimaryProductImage(props.productId, props.image.id);
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to set the primary image.");
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel eyebrow="Edit image">
      <form class="form-stack" @submit.prevent="saveImage">
        <AppNotice v-if="!assets.length" tone="warning" title="No product assets">
          Upload at least one asset from the Assets tab before changing this gallery image.
          <NuxtLink class="secondary-link ml-2" :to="`/products/${productId}?tab=assets`">
            Open assets
          </NuxtLink>
        </AppNotice>

        <div v-if="assets.length" class="grid gap-5">
          <ProductAssetPickerPanel
            :assets="assets"
            :selected-asset-id="form.assetId"
            :preview-img="image.img"
            preview-selected-text="Gallery image preview"
            preview-empty-text="Select an asset below"
            :show-fallback-preview="true"
            asset-alt="Product gallery image"
            @select="selectAsset"
          >
            <template #preview-actions>
              <AppButton
                v-if="!image.isPrimary"
                class="whitespace-nowrap"
                variant="secondary"
                :loading="actionPending === 'primary'"
                type="button"
                @click="setPrimary"
              >
                Set as primary
              </AppButton>
              <AppBadge v-else tone="success">Primary</AppBadge>
            </template>
          </ProductAssetPickerPanel>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.alt" label="Alt text" placeholder="Short storefront description" />
        </div>

        <AppNotice v-if="actionError" tone="danger" title="Image update failed">
          {{ actionError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
          <AppButton :loading="actionPending === 'save'" type="submit" :disabled="!form.assetId">
            Save changes
          </AppButton>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
