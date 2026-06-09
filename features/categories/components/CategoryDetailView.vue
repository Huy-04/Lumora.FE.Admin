<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { CategoryDetailPage } from "~/features/categories/composables/useCategoryDetailPage";
import type { CategoryTreeNodeResponse } from "~/features/categories/types";

const props = defineProps<{
  page: CategoryDetailPage;
}>();

const { confirmReorderOpen, pendingReorder, actionPending, confirmChildReorder, cancelChildReorder, confirmChildCategory, confirmChildHasChildren, childCategoryHasChildrenMessage, confirmChildRemoveAction, cancelChildRemove, error, pending, data, parentCategory, actionError, categoryTabs, activeTab, selectTab, childCategories, actionTargetId, requestChildReorder, toggleChildCategory, requestChildRemove, restoreChildCategory, refresh, canAddChildCategory, addChildDisabledReason, childStateGuardReason, getChildToggleDisabledReason, getChildRestoreDisabledReason } = props.page;

const selectCategoryTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  categoryTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

const findCategoryPath = (
  nodes: CategoryTreeNodeResponse[],
  categoryId: string,
  parents: CategoryTreeNodeResponse[] = [],
): CategoryTreeNodeResponse[] => {
  for (const node of nodes) {
    const currentPath = [...parents, node];

    if (node.id === categoryId) {
      return currentPath;
    }

    const childPath = findCategoryPath(node.children, categoryId, currentPath);
    if (childPath.length) {
      return childPath;
    }
  }

  return [];
};

useScopedPageBreadcrumbs(() => {
  const category = data.value?.category;
  if (!category) {
    return [];
  }

  const categoryPath = findCategoryPath(data.value?.tree ?? [], category.id);
  const resolvedPath = categoryPath.length
    ? categoryPath
    : [{ ...category, children: [] }];

  return [
    { label: "Categories", to: "/categories" },
    ...resolvedPath.map((entry) => ({
      label: entry.name,
      to: `/categories/${entry.id}`,
    })),
    { label: activeTabLabel.value },
  ];
});
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
      <AppConfirm
        :open="actionErrorOpen"
        title="Category action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />
    </template>

    <template v-if="data?.category">
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
        :can-add-child="canAddChildCategory"
        :add-child-disabled-reason="addChildDisabledReason"
        :child-state-guard-reason="childStateGuardReason"
        :get-child-toggle-disabled-reason="getChildToggleDisabledReason"
        :get-child-restore-disabled-reason="getChildRestoreDisabledReason"
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
