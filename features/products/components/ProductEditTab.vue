<script setup lang="ts">
import type { CategoryCatalogOption } from "~/features/categories/composables/useCategoryTreeCatalog";
import type { ProductResponse } from "~/features/products/types";

const props = defineProps<{
  product: ProductResponse;
  categoryOptions: CategoryCatalogOption[];
  canReadCategories: boolean;
  canUseCategoryCatalog: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const productApi = useProductAdminApi();
const { genderTargetValueOptions } = useProductOptions();

const form = reactive({
  categoryId: "",
  name: "",
  brand: "",
  slug: "",
  genderTarget: "0",
  shortDescription: "",
  description: "",
  highlights: "",
  ingredients: "",
  howToUse: "",
  storageGuide: "",
  caution: "",
  brandOrigin: "",
  manufactureLocation: "",
  manufactureDateNote: "",
  shelfLifeNote: "",
  seoTitle: "",
  seoDescription: "",
});

const actionPending = ref(false);
const actionError = ref("");
const actionSuccess = ref("");

watchEffect(() => {
  form.categoryId = props.product.categoryId;
  form.name = props.product.name;
  form.brand = props.product.brand;
  form.slug = props.product.slug;
  form.genderTarget = props.product.genderTarget === "Female"
    ? "1"
    : props.product.genderTarget === "Male"
      ? "2"
      : "0";
  form.shortDescription = props.product.content?.shortDescription || "";
  form.description = props.product.content?.description || "";
  form.highlights = props.product.content?.highlights || "";
  form.ingredients = props.product.content?.ingredients || "";
  form.howToUse = props.product.content?.howToUse || "";
  form.storageGuide = props.product.content?.storageGuide || "";
  form.caution = props.product.content?.caution || "";
  form.brandOrigin = props.product.content?.brandOrigin || "";
  form.manufactureLocation = props.product.content?.manufactureLocation || "";
  form.manufactureDateNote = props.product.content?.manufactureDateNote || "";
  form.shelfLifeNote = props.product.content?.shelfLifeNote || "";
  form.seoTitle = props.product.seoTitle || "";
  form.seoDescription = props.product.seoDescription || "";
});

const saveProduct = async () => {
  actionPending.value = true;
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await productApi.updateProduct(props.product.id, {
      categoryId: form.categoryId,
      name: form.name,
      brand: form.brand,
      slug: form.slug,
      genderTarget: Number(form.genderTarget),
      content: {
        shortDescription: form.shortDescription || null,
        description: form.description || null,
        highlights: form.highlights || null,
        ingredients: form.ingredients || null,
        howToUse: form.howToUse || null,
        storageGuide: form.storageGuide || null,
        caution: form.caution || null,
        brandOrigin: form.brandOrigin || null,
        manufactureLocation: form.manufactureLocation || null,
        manufactureDateNote: form.manufactureDateNote || null,
        shelfLifeNote: form.shelfLifeNote || null,
      },
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    });

    actionSuccess.value = "Product updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the product.");
  } finally {
    actionPending.value = false;
  }
};

</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel eyebrow="Edit product">
      <form class="form-stack" @submit.prevent="saveProduct">
        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect
            v-if="canUseCategoryCatalog"
            v-model="form.categoryId"
            label="Category"
            :options="categoryOptions"
          />
          <AppInput
            v-else
            v-model="form.categoryId"
            label="Category ID"
            placeholder="Enter category identifier"
          />

          <AppSelect
            v-model="form.genderTarget"
            label="Gender target"
            :options="genderTargetValueOptions"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.name" label="Product name" />
          <AppInput v-model="form.brand" label="Brand" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.slug" label="Slug" />
        </div>

        <AppTextarea v-model="form.shortDescription" label="Short description" placeholder="Short merchandising summary." />
        <AppTextarea v-model="form.description" label="Description" placeholder="Longer product story and usage notes." />
        <AppTextarea v-model="form.highlights" label="Highlights" placeholder="Key selling points, one per line if useful." />
        <AppTextarea v-model="form.ingredients" label="Ingredients" placeholder="Ingredient summary or packaging note." />
        <AppTextarea v-model="form.howToUse" label="How to use" placeholder="Short application steps for the storefront detail page." />
        <AppTextarea v-model="form.storageGuide" label="Storage guide" placeholder="Storage instructions, handling notes, and shelf guidance." />
        <AppTextarea v-model="form.caution" label="Caution" placeholder="Warnings, safety notes, or usage restrictions." />

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.brandOrigin" label="Brand origin" placeholder="Example: USA" />
          <AppInput v-model="form.manufactureLocation" label="Manufacture location" placeholder="Example: Canada" />
          <AppInput v-model="form.manufactureDateNote" label="Manufacture date note" placeholder="Example: See product packaging" />
          <AppInput v-model="form.shelfLifeNote" label="Shelf life note" placeholder="Example: See product packaging" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.seoTitle" label="SEO title" />
          <AppInput v-model="form.seoDescription" label="SEO description" />
        </div>

        <AppNotice v-if="actionSuccess" tone="success" title="Product updated">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice
          v-if="canReadCategories && !canUseCategoryCatalog"
          tone="warning"
          title="Category catalog unavailable"
        >
          Category options could not be loaded. You can still update the product
          by entering a category ID manually.
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Product update failed">
          {{ actionError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
