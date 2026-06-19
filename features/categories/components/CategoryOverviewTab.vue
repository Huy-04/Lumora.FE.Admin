<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import type {
  CategoryResponse,
  CategoryTreeNodeResponse,
} from "~/features/categories/types/categories";

const props = defineProps<{
  category: CategoryResponse;
  parent?: CategoryTreeNodeResponse | null;
  children: CategoryTreeNodeResponse[];
}>();

const { formatDateTime } = useAuthPresentation();

const activeChildren = computed(() => props.children.filter((child) => child.isActive && !child.isDeleted).length);
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppDetailMetaPanel eyebrow="Category details">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Name</dt>
          <dd class="text-sm font-medium text-ink">{{ category.name }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Slug</dt>
          <dd class="text-sm font-medium text-ink">{{ category.slug }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Category ID</dt>
          <dd class="break-all text-xs font-mono text-smoke">{{ category.id }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Parent</dt>
          <dd class="text-sm text-smoke">{{ parent ? parent.name : "Root category" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Level</dt>
          <dd class="text-sm text-smoke">{{ category.level }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Deleted</dt>
          <dd class="text-sm text-smoke">{{ category.isDeleted ? "Yes" : "No" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Sort order</dt>
          <dd class="text-sm text-smoke">{{ category.sortOrder }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Description</dt>
          <dd class="text-sm text-smoke">{{ category.description || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Image URL</dt>
          <dd class="break-all text-sm text-smoke">{{ category.img || "Not set" }}</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Hierarchy and SEO">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Children</dt>
          <dd class="text-sm font-medium text-ink">{{ children.length }} total / {{ activeChildren }} active</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">SEO title</dt>
          <dd class="text-sm text-smoke">{{ category.seoTitle || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">SEO description</dt>
          <dd class="text-sm text-smoke">{{ category.seoDescription || "Not set" }}</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Audit trail">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created at</dt>
          <dd class="text-sm text-smoke">{{ category.createdAt ? formatDateTime(category.createdAt) : "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created by</dt>
          <dd class="text-sm text-smoke">{{ category.createdBy || "System" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated at</dt>
          <dd class="text-sm text-smoke">{{ category.updatedAt ? formatDateTime(category.updatedAt) : "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated by</dt>
          <dd class="text-sm text-smoke">{{ category.updatedBy || "System" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Deleted at</dt>
          <dd class="text-sm text-smoke">{{ category.deletedAt ? formatDateTime(category.deletedAt) : "Not deleted" }}</dd>
        </div>
    </AppDetailMetaPanel>
  </div>
</template>
