import type { CategoryTreeNodeResponse } from "~/features/categories/types";

export const useCategoryDetailPage = async () => {
  const route = useRoute();
  const categoryApi = useCategoryAdminApi();
  const authz = useAdminAuthorization();

  type CategoryTab = "overview" | "children" | "edit";

  const findCategoryNode = (nodes: CategoryTreeNodeResponse[], id: string): CategoryTreeNodeResponse | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      const childMatch = findCategoryNode(node.children, id);
      if (childMatch) {
        return childMatch;
      }
    }

    return null;
  };

  const categoryId = computed(() => route.params.id as string);
  const canEditCategoryPermission = computed(() => authz.can(ADMIN_PERMISSION.categoryUpdateAll));
  const canActivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryActivateAll));
  const canDeactivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeactivateAll));
  const confirmReorderOpen = ref(false);
  const confirmChildRemoveId = ref("");
  const actionPending = ref<"" | "reorder" | "toggle" | "remove">("");
  const actionError = ref("");
  const actionTargetId = ref("");
  const pendingReorder = ref<null | {
    sourceId: string;
    sourceName: string;
    targetName: string;
    items: Array<{ categoryId: string; sortOrder: number }>;
  }>(null);

  const { data, pending, error, refresh } = await useAsyncData(
    () => `category-detail:${categoryId.value}`,
    async () => {
      const [category, tree] = await Promise.all([
        categoryApi.getCategoryById(categoryId.value),
        categoryApi.getAllCategoryTree(),
      ]);

      return {
        category,
        tree,
      };
    },
  );

  const canEditCategory = computed(() => canEditCategoryPermission.value && !data.value?.category.isDeleted);

  const isRootCategory = computed(() => data.value?.category.level === 0);

  const categoryTabs = computed<Array<{ label: string; value: CategoryTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(isRootCategory.value ? [{ label: "Children", value: "children" as const }] : []),
    ...(canEditCategory.value ? [{ label: "Edit", value: "edit" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): CategoryTab => {
    const resolved = value === "edit"
      ? "edit"
      : value === "children"
        ? "children"
        : "overview";
    return categoryTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const activeTab = ref<CategoryTab>("overview");

  const currentTreeNode = computed(() => {
    const category = data.value?.category;
    if (!category) {
      return null;
    }

    return findCategoryNode(data.value?.tree ?? [], category.id);
  });

  const parentCategory = computed(() => {
    const parentId = data.value?.category.parentId;
    if (!parentId) {
      return null;
    }

    return findCategoryNode(data.value?.tree ?? [], parentId);
  });

  const childCategories = computed(() =>
    [...(currentTreeNode.value?.children ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
  );

  const confirmChildCategory = computed(() =>
    childCategories.value.find((child) => child.id === confirmChildRemoveId.value) ?? null,
  );

  const confirmChildHasChildren = computed(() =>
    Boolean(confirmChildCategory.value?.children.length),
  );

  const childCategoryHasChildrenMessage = (categoryName: string) =>
    `Child category ${categoryName} still has nested child categories and cannot be removed.`;

  const isChildRemoveBlockedByChildren = (requestError: unknown) => {
    const problem = getProblemDetails(requestError);
    const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];

    return problem?.status === 409
      && normalizedErrors.some((entry) =>
        entry.field === "CategoryParentId" && entry.errorCode === "InvalidStatus");
  };

  const buildReorderItems = (items: CategoryTreeNodeResponse[], sourceId: string, targetId: string) => {
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return null;
    }

    const reordered = [...items];
    const [movedItem] = reordered.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    reordered.splice(insertIndex, 0, movedItem);

    return reordered.map((item, index) => ({
      categoryId: item.id,
      sortOrder: index + 1,
    }));
  };

  const selectTab = async (tab: CategoryTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/categories/${categoryId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(route.query.tab);
  });

  const cancelChildReorder = () => {
    confirmReorderOpen.value = false;
    pendingReorder.value = null;
  };

  const requestChildRemove = (child: CategoryTreeNodeResponse) => {
    confirmChildRemoveId.value = child.id;
    actionError.value = "";
  };

  const cancelChildRemove = () => {
    confirmChildRemoveId.value = "";
  };

  const requestChildReorder = (payload: { sourceId: string; targetId: string; sourceName: string; targetName: string }) => {
    const items = buildReorderItems(childCategories.value, payload.sourceId, payload.targetId);
    if (!items) {
      return;
    }

    pendingReorder.value = {
      sourceId: payload.sourceId,
      sourceName: payload.sourceName,
      targetName: payload.targetName,
      items,
    };
    confirmReorderOpen.value = true;
  };

  const toggleChildCategory = async (child: CategoryTreeNodeResponse) => {
    if (child.isActive && !canDeactivateCategory.value) {
      return;
    }

    if (!child.isActive && !canActivateCategory.value) {
      return;
    }

    actionPending.value = "toggle";
    actionTargetId.value = child.id;
    actionError.value = "";

    try {
      if (child.isActive) {
        await categoryApi.deactivateCategory(child.id);
      } else {
        await categoryApi.activateCategory(child.id);
      }

      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the child category status.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const restoreChildCategory = async (child: CategoryTreeNodeResponse) => {
    actionPending.value = "remove";
    actionTargetId.value = child.id;
    actionError.value = "";

    try {
      await categoryApi.restoreCategory(child.id);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to restore the child category.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const confirmChildReorder = async () => {
    if (!pendingReorder.value) {
      return;
    }

    actionPending.value = "reorder";
    actionTargetId.value = pendingReorder.value.sourceId;
    actionError.value = "";

    try {
      await categoryApi.reorderCategories({
        items: pendingReorder.value.items,
      });

      confirmReorderOpen.value = false;
      pendingReorder.value = null;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to reorder child categories.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const removeChildCategory = async () => {
    if (!confirmChildCategory.value) {
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmChildCategory.value.id;
    actionError.value = "";

    try {
      await categoryApi.deleteCategory(confirmChildCategory.value.id);

      confirmChildRemoveId.value = "";
      await refresh();
    } catch (requestError) {
      actionError.value = isChildRemoveBlockedByChildren(requestError) && confirmChildCategory.value
        ? childCategoryHasChildrenMessage(confirmChildCategory.value.name)
        : getProblemMessage(requestError, "Unable to remove the child category.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const confirmChildRemoveAction = async () => {
    if (confirmChildHasChildren.value) {
      cancelChildRemove();
      return;
    }

    await removeChildCategory();
  };

  return {
    confirmReorderOpen,
    pendingReorder,
    actionPending,
    confirmChildReorder,
    cancelChildReorder,
    confirmChildCategory,
    confirmChildHasChildren,
    childCategoryHasChildrenMessage,
    confirmChildRemoveAction,
    cancelChildRemove,
    error,
    pending,
    data,
    parentCategory,
    actionError,
    categoryTabs,
    activeTab,
    selectTab,
    childCategories,
    actionTargetId,
    requestChildReorder,
    toggleChildCategory,
    requestChildRemove,
    restoreChildCategory,
    refresh,
  };
};

export type CategoryDetailPage = Awaited<ReturnType<typeof useCategoryDetailPage>>;
