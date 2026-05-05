<script setup lang="ts">
import type { CategoryCreatePage } from "~/features/categories/composables/useCategoryCreatePage";

const props = defineProps<{
  page: CategoryCreatePage;
}>();

const { form, pending, errorMessage, categoryCatalogError, canReadCategories, activeRootOptions, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppPanel
        eyebrow="Create category"
        title="Create category"
        description="Create a new root category or attach a child category under an active root parent."
      >
        <form class="form-stack" @submit.prevent="submit">
          <div class="grid gap-4">
            <AppSelect
              v-model="form.mode"
              label="Mode"
              :options="[
                { label: 'Root category', value: 'root' },
                { label: 'Child category', value: 'child' },
              ]"
            />
          </div>

          <div v-if="form.mode === 'child'" class="grid gap-4">
            <AppSelect
              v-if="canReadCategories"
              v-model="form.parentId"
              label="Parent category"
              :options="activeRootOptions"
            />
            <AppInput
              v-else
              v-model="form.parentId"
              label="Parent category ID"
              placeholder="Enter an active root category ID"
            />

            <AppNotice v-if="categoryCatalogError" tone="warning" title="Parent catalog unavailable">
              {{ getProblemMessage(categoryCatalogError, "Parent category options could not be loaded. You can still enter a parent ID manually if needed.") }}
            </AppNotice>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.name" label="Category name" placeholder="Skincare" />
            <AppInput v-model="form.slug" label="Slug" placeholder="skincare" />
          </div>

          <AppTextarea
            v-model="form.description"
            label="Description"
            placeholder="Explain the purpose of this category."
          />

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput v-model="form.img" label="Image URL" placeholder="https://example.com/image.jpg" />
            <AppInput v-model="form.seoTitle" label="SEO title" />
          </div>

          <AppTextarea v-model="form.seoDescription" label="SEO description" placeholder="Short search-result summary." />

          <AppNotice v-if="errorMessage" tone="danger" title="Create category failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit">Create category</AppButton>
            <NuxtLink class="secondary-link" to="/categories">
              Back to categories
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
