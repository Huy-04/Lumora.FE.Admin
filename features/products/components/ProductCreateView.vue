<script setup lang="ts">
import type { ProductCreatePage } from "~/features/products/composables/useProductCreatePage";

const props = defineProps<{
  page: ProductCreatePage;
}>();

const { form, canReadCategories, categoryOptions, genderTargetValueOptions, categoryCatalogError, errorMessage, pending, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppPanel
        eyebrow="Create product"
        title="Create product"
        description="Create the core product record first. Product order is assigned automatically, then continue into variants, assets, gallery, and attributes."
      >
        <form class="form-stack" @submit.prevent="submit">
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

          <AppNotice v-if="categoryCatalogError" tone="warning" title="Category catalog unavailable">
            {{ getProblemMessage(categoryCatalogError, "Category options could not be loaded. You can still enter a category ID manually if needed.") }}
          </AppNotice>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.name" label="Product name" placeholder="Hydra Dew Cleanser" />
            <AppInput v-model="form.brand" label="Brand" placeholder="Lumora" />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.slug" label="Slug" placeholder="hydra-dew-cleanser" />
          </div>

          <AppTextarea
            v-model="form.shortDescription"
            label="Short description"
            placeholder="Short merchandising summary for list views."
          />

          <AppTextarea
            v-model="form.description"
            label="Description"
            placeholder="Longer product story, benefit summary, and usage notes."
          />

          <AppTextarea
            v-model="form.highlights"
            label="Highlights"
            placeholder="Key selling points, one per line if useful."
          />

          <AppTextarea
            v-model="form.ingredients"
            label="Ingredients"
            placeholder="Ingredient summary or packaging note."
          />

          <AppTextarea
            v-model="form.howToUse"
            label="How to use"
            placeholder="Short application steps for the storefront detail page."
          />

          <AppTextarea
            v-model="form.storageGuide"
            label="Storage guide"
            placeholder="Storage instructions, handling notes, and shelf guidance."
          />

          <AppTextarea
            v-model="form.caution"
            label="Caution"
            placeholder="Warnings, safety notes, or usage restrictions."
          />

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

          <AppNotice v-if="errorMessage" tone="danger" title="Create product failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit">Create product</AppButton>
            <NuxtLink class="secondary-link" to="/products">
              Back to products
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
