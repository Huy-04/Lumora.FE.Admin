<script setup lang="ts">
import type { CategoryDetailPage } from "~/features/categories/composables/useCategoryDetailPage";

const props = defineProps<{
  page: CategoryDetailPage;
}>();

const { confirmReorderOpen, pendingReorder, actionPending, confirmChildReorder, cancelChildReorder, confirmChildCategory, confirmChildHasChildren, childCategoryHasChildrenMessage, confirmChildRemoveAction, cancelChildRemove, error, pending, data, parentCategory, actionError, categoryTabs, activeTab, selectTab, childCategories, actionTargetId, requestChildReorder, toggleChildCategory, requestChildRemove, restoreChildCategory, refresh } = props.page;

const selectCategoryTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};
</script>

<template>
  <AppDetailPage
    :title="data?.category?.name ?? ''"
    :tabs="categoryTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? getProblemMessage(error, 'The category detail could not be loaded.') : null"
    error-title="Unable to load category"
    @select-tab="selectCategoryTab"
  >
    <template #modals>
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
    </template>

    <template v-if="data?.category">
      <AppNotice v-if="actionError" tone="danger" title="Category action failed">
        {{ actionError }}
      </AppNotice>

      <CategoryOverviewTab
        v-if="activeTab === 'overview'"
        :category="data.category"
        :parent="parentCategory"
        :children="childCategories"
      />
      <CategoryChildrenTab
        v-else-if="activeTab === 'children'"
        :category="data.category"
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
        :category="data.category"
        :parent="parentCategory"
        :tree="data.tree"
        :children="childCategories"
        @refresh="refresh"
      />
    </template>
  </AppDetailPage>
</template>
