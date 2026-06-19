import type { CategoryTreeNodeResponse } from "~/features/categories/types/categories";

type ReorderItem = {
  categoryId: string;
  sortOrder: number;
};

export const useCategoryIndexActions = (
  categoryApi: ReturnType<typeof useCategoryAdminApi>,
  roots: ComputedRef<CategoryTreeNodeResponse[]>,
  payload: Ref<{ tree: CategoryTreeNodeResponse[] } | null | undefined>,
  canDragRoots: ComputedRef<boolean>,
  refresh: () => Promise<void>,
) => {
  const confirmCategoryId = ref("");
  const actionPending = ref<"" | "remove" | "toggle" | "reorder">("");
  const actionTargetId = ref("");
  const actionError = ref("");
  const dragSourceId = ref("");
  const dragTargetId = ref("");
  const pendingReorder = ref<null | {
    sourceId: string;
    sourceName: string;
    targetName: string;
    items: ReorderItem[];
  }>(null);

  const confirmCategory = computed(() =>
    roots.value.find((category) => category.id === confirmCategoryId.value) ?? null,
  );

  const confirmCategoryHasChildren = computed(() =>
    Boolean(confirmCategory.value?.children.some((child) => !child.isDeleted)),
  );

  const categoryHasChildrenMessage = (categoryName: string) =>
    `Root category ${categoryName} still has child categories and cannot be removed.`;

  const isRemoveBlockedByChildren = (requestError: unknown) => {
    const problem = getProblemDetails(requestError);
    const normalizedErrors = Array.isArray(problem?.errors) ? problem.errors : [];

    return problem?.status === 409
      && normalizedErrors.some((entry) =>
        entry.field === "CategoryParentId" && entry.errorCode === "InvalidStatus");
  };

  const requestRemove = (categoryId: string) => {
    confirmCategoryId.value = categoryId;
    actionError.value = "";
  };

  const cancelRemove = () => {
    confirmCategoryId.value = "";
  };

  const removeCategory = async () => {
    if (!confirmCategoryId.value) {
      return;
    }

    actionPending.value = "remove";
    actionTargetId.value = confirmCategoryId.value;
    actionError.value = "";

    try {
      await categoryApi.deleteCategory(confirmCategoryId.value);
      confirmCategoryId.value = "";
      await refresh();
    } catch (requestError) {
      actionError.value = isRemoveBlockedByChildren(requestError) && confirmCategory.value
        ? categoryHasChildrenMessage(confirmCategory.value.name)
        : getProblemMessage(requestError, "Unable to remove the category.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const confirmRemoveAction = async () => {
    if (confirmCategoryHasChildren.value) {
      cancelRemove();
      return;
    }

    await removeCategory();
  };

  const restoreCategory = async (category: CategoryTreeNodeResponse) => {
    actionPending.value = "remove";
    actionTargetId.value = category.id;
    actionError.value = "";

    try {
      await categoryApi.restoreCategory(category.id);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to restore the category.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const toggleCategory = async (category: CategoryTreeNodeResponse) => {
    actionPending.value = "toggle";
    actionTargetId.value = category.id;
    actionError.value = "";

    try {
      if (category.isActive) {
        await categoryApi.deactivateCategory(category.id);
      } else {
        await categoryApi.activateCategory(category.id);
      }

      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the category status.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  const resetDragState = () => {
    dragSourceId.value = "";
    dragTargetId.value = "";
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

  const handleRootDragStart = (rootId: string) => {
    if (!canDragRoots.value) {
      return;
    }

    dragSourceId.value = rootId;
    dragTargetId.value = "";
  };

  const handleRootDragOver = (rootId: string) => {
    if (!canDragRoots.value || !dragSourceId.value || dragSourceId.value === rootId) {
      return;
    }

    dragTargetId.value = rootId;
  };

  const handleRootDrop = (targetId: string) => {
    if (!canDragRoots.value || !dragSourceId.value || dragSourceId.value === targetId) {
      resetDragState();
      return;
    }

    const items = buildReorderItems(roots.value, dragSourceId.value, targetId);
    if (!items) {
      resetDragState();
      return;
    }

    const sourceRoot = roots.value.find((item) => item.id === dragSourceId.value);
    const targetRoot = roots.value.find((item) => item.id === targetId);

    if (!sourceRoot || !targetRoot) {
      resetDragState();
      return;
    }

    pendingReorder.value = {
      sourceId: sourceRoot.id,
      sourceName: sourceRoot.name,
      targetName: targetRoot.name,
      items,
    };

    resetDragState();
  };

  const confirmRootReorder = async () => {
    if (!pendingReorder.value) {
      return;
    }

    actionPending.value = "reorder";
    actionTargetId.value = pendingReorder.value.sourceId;
    actionError.value = "";

    const previousPayload = payload.value
      ? {
          ...payload.value,
          tree: [...payload.value.tree],
        }
      : null;

    if (payload.value && pendingReorder.value.items.length) {
      const orderMap = new Map(pendingReorder.value.items.map((item) => [item.categoryId, item.sortOrder]));
      payload.value = {
        ...payload.value,
        tree: payload.value.tree.map((node) => {
          const newSortOrder = orderMap.get(node.id);
          return newSortOrder !== undefined ? { ...node, sortOrder: newSortOrder } : node;
        }),
      };
    }

    const reorderPayload = { items: pendingReorder.value.items };
    pendingReorder.value = null;

    try {
      await categoryApi.reorderCategories(reorderPayload);
      await refresh();
    } catch (requestError) {
      if (previousPayload) {
        payload.value = previousPayload;
      }
      actionError.value = getProblemMessage(requestError, "Unable to reorder categories.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionTargetId,
    cancelRemove,
    categoryHasChildrenMessage,
    confirmCategory,
    confirmCategoryHasChildren,
    confirmCategoryId,
    confirmRemoveAction,
    confirmRootReorder,
    dragSourceId,
    dragTargetId,
    handleRootDragOver,
    handleRootDragStart,
    handleRootDrop,
    pendingReorder,
    requestRemove,
    resetDragState,
    restoreCategory,
    toggleCategory,
  };
};
