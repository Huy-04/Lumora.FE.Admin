<script setup lang="ts">
import type {
  CategoryResponse,
  CategoryTreeNodeResponse,
} from "~/features/categories/types";

const props = defineProps<{
  category: CategoryResponse;
  parent?: CategoryTreeNodeResponse | null;
  tree: CategoryTreeNodeResponse[];
  children: CategoryTreeNodeResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();
const {
  actionError,
  actionPending,
  form,
  moveCategory,
  moveError,
  moveForm,
  moveHelpText,
  movePending,
  parentOptions,
  saveCategory,
} = useCategoryEditTab(props, () => emit("refresh"));
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel eyebrow="Edit category">
      <form class="form-stack" @submit.prevent="saveCategory">
        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.name" label="Category name" />
          <AppInput v-model="form.slug" label="Slug" />
        </div>

        <AppTextarea v-model="form.description" label="Description" placeholder="Explain what belongs in this category." />

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="form.img" label="Image URL" placeholder="https://…" />
          <AppInput v-model="form.seoTitle" label="SEO title" />
        </div>

        <AppTextarea v-model="form.seoDescription" label="SEO description" placeholder="Short search-result summary." />

        <AppNotice v-if="actionError" tone="danger" title="Category update failed">
          {{ actionError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>
      </form>
    </AppPanel>

    <AppPanel eyebrow="Move category">
      <form class="form-stack" @submit.prevent="moveCategory">
        <AppNotice tone="info" title="Hierarchy rule">
          {{ moveHelpText }}
        </AppNotice>

        <div class="grid gap-4">
          <AppSelect
            v-model="moveForm.parentId"
            label="Parent scope"
            :options="parentOptions"
          />
        </div>

        <AppNotice v-if="moveError" tone="danger" title="Move category failed">
          {{ moveError }}
        </AppNotice>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
          <p class="text-sm text-smoke">
            Current parent: {{ parent?.name ?? "Root category" }}
          </p>
          <AppButton :loading="movePending" type="submit">Move category</AppButton>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
