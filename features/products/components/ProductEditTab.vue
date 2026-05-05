<script setup lang="ts">
import type { CategoryCatalogOption } from "~/features/categories/composables/useCategoryTreeCatalog";
import type { ProductResponse } from "~/features/products/types";

const props = defineProps<{
  product: ProductResponse;
  categoryOptions: CategoryCatalogOption[];
  canReadCategories: boolean;
  canPublish: boolean;
  canDiscontinue: boolean;
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
const lifecyclePending = ref<"" | "publish" | "unpublish" | "discontinue">("");
const lifecycleError = ref("");
const lifecycleSuccess = ref("");

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

const publishProduct = async () => {
  lifecyclePending.value = "publish";
  lifecycleError.value = "";
  lifecycleSuccess.value = "";

  try {
    await productApi.publishProduct(props.product.id);
    lifecycleSuccess.value = "Product published.";
    emit("refresh");
  } catch (requestError) {
    const problem = getProblemDetails(requestError);
    const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];
    const publishBlockedReasons: string[] = [];

    if (normalizedErrors.some((entry) => entry.field === "VariantStatus" && entry.errorCode === "InvalidStatus")) {
      publishBlockedReasons.push("Add or activate at least one variant before publishing.");
    }

    if (normalizedErrors.some((entry) => entry.field === "ProductId" && entry.errorCode === "Required")) {
      publishBlockedReasons.push("Add at least one gallery image before publishing.");
    }

    lifecycleError.value = publishBlockedReasons.length
      ? publishBlockedReasons.join(" ")
      : getProblemMessage(requestError, "Unable to publish the product.");
  } finally {
    lifecyclePending.value = "";
  }
};

const unpublishProduct = async () => {
  lifecyclePending.value = "unpublish";
  lifecycleError.value = "";
  lifecycleSuccess.value = "";

  try {
    await productApi.unpublishProduct(props.product.id);
    lifecycleSuccess.value = "Product moved back to draft.";
    emit("refresh");
  } catch (requestError) {
    lifecycleError.value = getProblemMessage(requestError, "Unable to unpublish the product.");
  } finally {
    lifecyclePending.value = "";
  }
};

const discontinueProduct = async () => {
  lifecyclePending.value = "discontinue";
  lifecycleError.value = "";
  lifecycleSuccess.value = "";

  try {
    await productApi.discontinueProduct(props.product.id);
    lifecycleSuccess.value = "Product discontinued.";
    emit("refresh");
  } catch (requestError) {
    lifecycleError.value = getProblemMessage(requestError, "Unable to discontinue the product.");
  } finally {
    lifecyclePending.value = "";
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel
      v-if="canPublish || canDiscontinue"
      title="Lifecycle"
      description="Keep the selling state in sync with how this product should appear in the catalog."
    >
      <AppNotice v-if="lifecycleSuccess" tone="success" title="Product updated">
        {{ lifecycleSuccess }}
      </AppNotice>

      <AppNotice v-if="lifecycleError" tone="danger" title="Product action failed">
        {{ lifecycleError }}
      </AppNotice>

      <div class="panel-action-row">
        <AppButton
          v-if="canPublish && product.status !== 'Published'"
          :loading="lifecyclePending === 'publish'"
          @click="publishProduct"
        >
          Publish
        </AppButton>
        <AppButton
          v-if="canPublish && product.status === 'Published'"
          variant="secondary"
          :loading="lifecyclePending === 'unpublish'"
          @click="unpublishProduct"
        >
          Unpublish
        </AppButton>
        <AppButton
          v-if="canDiscontinue && product.status === 'Published'"
          variant="secondary"
          :loading="lifecyclePending === 'discontinue'"
          @click="discontinueProduct"
        >
          Discontinue
        </AppButton>
      </div>
    </AppPanel>

    <AppPanel title="Edit product" description="Update catalog content, category placement, and search metadata. Product order is managed outside this form.">
      <form class="form-stack" @submit.prevent="saveProduct">
        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect
            v-if="canReadCategories"
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

        <AppNotice v-if="actionError" tone="danger" title="Product update failed">
          {{ actionError }}
        </AppNotice>

        <div class="panel-action-row border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
          <NuxtLink class="secondary-link" to="/products">
            Back to products
          </NuxtLink>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
