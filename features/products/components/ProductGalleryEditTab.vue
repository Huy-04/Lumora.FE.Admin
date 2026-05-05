<script setup lang="ts">
import type { ProductImageResponse } from "~/features/products/types";

const props = defineProps<{
  productId: string;
  image: ProductImageResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const productApi = useProductAdminApi();

const form = reactive({
  alt: "",
});

const actionPending = ref<"" | "alt" | "primary">("");
const actionError = ref("");
const actionSuccess = ref("");

watchEffect(() => {
  form.alt = props.image.alt || "";
});

const saveImage = async () => {
  actionPending.value = "alt";
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await productApi.updateProductImageAlt(props.productId, props.image.id, {
      alt: form.alt || null,
    });

    actionSuccess.value = "Image alt updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the image alt text.");
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
  actionSuccess.value = "";

  try {
    await productApi.setPrimaryProductImage(props.productId, props.image.id);
    actionSuccess.value = "Primary image updated.";
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
    <AppPanel title="Edit image" description="Update alt text and choose whether this image is the main storefront product image without changing gallery order inside the table.">
      <form class="form-stack" @submit.prevent="saveImage">
        <div class="soft-card mx-auto flex w-full max-w-[280px] items-center justify-center p-3 sm:max-w-[320px]">
          <img
            :src="image.img"
            :alt="image.alt || 'Product gallery image'"
            class="aspect-square w-full rounded-lg border border-line/60 object-cover"
          >
        </div>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <AppInput v-model="form.alt" label="Alt text" placeholder="Short storefront description" />
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
        </div>

        <AppNotice v-if="actionSuccess" tone="success" title="Gallery updated">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Image update failed">
          {{ actionError }}
        </AppNotice>

        <div class="panel-action-row border-t border-line/70 pt-4">
          <AppButton :loading="actionPending === 'alt'" type="submit">Save changes</AppButton>
          <NuxtLink class="secondary-link" :to="`/products/${productId}?tab=gallery`">
            Back to gallery
          </NuxtLink>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
