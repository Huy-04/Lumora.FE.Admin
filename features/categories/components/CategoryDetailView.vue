<script setup lang="ts">
import type { CategoryDetailPage } from "~/features/categories/composables/useCategoryDetailPage";

const props = defineProps<{
  page: CategoryDetailPage;
}>();

const { confirmReorderOpen, pendingReorder, actionPending, confirmChildReorder, cancelChildReorder, confirmChildCategory, confirmChildHasChildren, childCategoryHasChildrenMessage, confirmChildRemoveAction, cancelChildRemove, error, pending, data, parentCategory, actionError, categoryTabs, activeTab, selectTab, childCategories, actionTargetId, requestChildReorder, toggleChildCategory, requestChildRemove, restoreChildCategory, refresh } = props.page;
</script>

<template>
  <div class="detail-shell">
    <AppConfirm
      :open="confirmReorderOpen"
      :title="pendingReorder ? `Move ${pendingReorder.sourceName}?` : ''"
      :detail="pendingReorder ? `Place this child category before ${pendingReorder.targetName}. The child sort order will be updated after confirmation.` : ''"
      confirm-label="Save order"
      :loading="actionPending === 'reorder'"
      @confirm="confirmChildReorder"
      @cancel="cancelChildReorder"
    />
    <AppConfirm
      :open="confirmChildCategory !== null"
      :title="confirmChildCategory
        ? confirmChildHasChildren
          ? `Cannot remove ${confirmChildCategory.name}`
          : `Remove ${confirmChildCategory.name}?`
        : ''"
      :detail="confirmChildCategory
        ? confirmChildHasChildren
          ? childCategoryHasChildrenMessage(confirmChildCategory.name)
          : 'This action soft-deletes the child category.'
        : ''"
      :cancel-label="confirmChildHasChildren ? 'Close' : 'Cancel'"
      :hide-confirm="confirmChildHasChildren"
      :confirm-label="confirmChildHasChildren ? '' : 'Remove'"
      :tone="confirmChildHasChildren ? 'warning' : 'danger'"
      :loading="actionPending === 'remove'"
      @confirm="confirmChildRemoveAction"
      @cancel="cancelChildRemove"
    />

    <AppNotice v-if="error" tone="danger" title="Unable to load category">
      {{ getProblemMessage(error, "The category detail could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data?.category" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Admin</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/categories">Categories</NuxtLink>
        </div>
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="min-w-0">
            <h1 class="detail-title">{{ data.category.name }}</h1>
            <p class="detail-copy">
              {{ data.category.slug }}
              <span v-if="parentCategory"> / child of {{ parentCategory.name }}</span>
              <span v-else> / root category</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <AppBadge :tone="data.category.isDeleted ? 'danger' : data.category.isActive ? 'success' : 'warning'">
              {{ data.category.isDeleted ? "Deleted" : data.category.isActive ? "Active" : "Inactive" }}
            </AppBadge>
            <AppBadge>Level {{ data.category.level }}</AppBadge>
            <AppBadge>Order {{ data.category.sortOrder }}</AppBadge>
          </div>
        </div>

        <AppNotice v-if="actionError" tone="danger" title="Category action failed">
          {{ actionError }}
        </AppNotice>

        <div class="detail-tabs">
          <button
            v-for="tab in categoryTabs"
            :key="tab.value"
            type="button"
            class="detail-tab"
            :class="{ 'detail-tab-active': activeTab === tab.value }"
            @click="selectTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </section>

      <section v-if="pending" class="detail-stack">
        <div class="soft-card h-72 animate-pulse" />
        <div class="soft-card h-48 animate-pulse" />
      </section>

      <section v-else class="detail-stack">
        <CategoryOverviewTab
          v-if="activeTab === 'overview'"
          :category="data!.category"
          :parent="parentCategory"
          :children="childCategories"
        />
        <CategoryChildrenTab
          v-else-if="activeTab === 'children'"
          :category="data!.category"
          :children="childCategories"
          :action-pending="actionPending === 'toggle' || actionPending === 'remove'"
          :action-target-id="actionTargetId"
          @request-reorder="requestChildReorder"
          @request-toggle="toggleChildCategory"
          @request-remove="requestChildRemove"
          @request-restore="restoreChildCategory"
        />
        <CategoryEditTab
          v-else
          :category="data!.category"
          :parent="parentCategory"
          :tree="data!.tree"
          :children="childCategories"
          @refresh="refresh"
        />
      </section>
    </template>
  </div>
</template>
