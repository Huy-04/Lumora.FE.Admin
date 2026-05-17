import type { CategoryTreeNodeResponse } from "~/features/categories/types";

type ReorderItem = {
  categoryId: string;
  sortOrder: number;
};

export const useCategoryIndexPage = async () => {
  // 1. Dependency injection
  const categoryApi = useCategoryAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const canCreateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryCreateAll));
  const canUpdateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryUpdateAll));
  const canDeleteCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeleteAll));
  const canActivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryActivateAll));
  const canDeactivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeactivateAll));
  const canReorderCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryReorderAll));
  const canRestoreCategory = canDeleteCategory;

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "", activeFilter: "" },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    "categories:all:admin",
    () => categoryApi.getAllCategoryTree(),
  );

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useCatalogRealtime((notification) => {
    if (notification.entity === "category") {
      realtimeRefresh.scheduleRefresh();
    }
  });

  // 6. Computed derivations
  const roots = computed(() =>
    [...(data.value ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
  );

  const normalizedKeyword = computed(() => appliedFilters.keyword.value.trim().toLowerCase());

  const filteredRoots = computed(() =>
    roots.value.filter((root) => {
      const matchesKeyword = !normalizedKeyword.value
        || root.name.toLowerCase().includes(normalizedKeyword.value)
        || root.slug.toLowerCase().includes(normalizedKeyword.value);

      const matchesStatus = appliedFilters.activeFilter.value === ""
        || String(root.isActive) === appliedFilters.activeFilter.value;

      return matchesKeyword && matchesStatus;
    }),
  );

  // Wire totalItems to filtered results length
  watch(filteredRoots, (filtered) => {
    totalItems.value = filtered.length;
  }, { immediate: true });

  const pagedRoots = computed(() => {
    const start = (pagination.page.value - 1) * Number(pagination.pageSize.value);
    return filteredRoots.value.slice(start, start + Number(pagination.pageSize.value));
  });

  const canDragRoots = computed(() =>
    canReorderCategory.value
    && !normalizedKeyword.value
    && !appliedFilters.activeFilter.value
    && roots.value.every((root) => !root.isDeleted),
  );

  const totalChildren = computed(() =>
    roots.value.reduce((sum, root) => sum + root.children.length, 0),
  );

  const activeChildCount = (root: CategoryTreeNodeResponse) =>
    root.children.filter((child) => child.isActive && !child.isDeleted).length;

  const summaryStats = computed(() => [
    {
      label: "Visible roots",
      value: `${filteredRoots.value.length}`,
      detail: normalizedKeyword.value || appliedFilters.activeFilter.value
        ? "Root categories matching the current view filters."
        : "Root categories available in the catalog tree.",
    },
    {
      label: "All roots",
      value: `${roots.value.length}`,
      detail: "Top-level entry points for catalog browsing.",
    },
    {
      label: "Child categories",
      value: `${totalChildren.value}`,
      detail: "Managed from each root detail page instead of the index.",
    },
    {
      label: "Active roots",
      value: `${roots.value.filter((root) => root.isActive && !root.isDeleted).length}`,
      detail: "Roots currently visible to storefront flows.",
    },
  ]);

  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The category module is unavailable."));

  // 7. Actions/mutations
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
    Boolean(confirmCategory.value?.children.length),
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

  const statusTone = (category: CategoryTreeNodeResponse) => {
    if (category.isDeleted) return "danger";
    return category.isActive ? "success" : "warning";
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

    // Optimistic UI update: apply new sort orders before server confirms
    const previousData = data.value ? [...data.value] : null;
    if (data.value && pendingReorder.value.items.length) {
      const orderMap = new Map(pendingReorder.value.items.map((item) => [item.categoryId, item.sortOrder]));
      data.value = data.value.map((node) => {
        const newSortOrder = orderMap.get(node.id);
        return newSortOrder !== undefined ? { ...node, sortOrder: newSortOrder } : node;
      });
    }

    const reorderPayload = { items: pendingReorder.value.items };
    pendingReorder.value = null;

    try {
      await categoryApi.reorderCategories(reorderPayload);
      await refresh();
    } catch (requestError) {
      // Revert optimistic update on failure
      if (previousData) {
        data.value = previousData;
      }
      actionError.value = getProblemMessage(requestError, "Unable to reorder categories.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  // 8. Watchers
  // (pagination reset on filter/pageSize change is handled by useFilters onApply and usePagination internal watcher)

  // 9. Return statement
  return {
    actionError,
    actionPending,
    actionTargetId,
    activeChildCount,
    applyFilters,
    canActivateCategory,
    canCreateCategory,
    canDeactivateCategory,
    canDeleteCategory,
    canDragRoots,
    canReorderCategory,
    canRestoreCategory,
    canUpdateCategory,
    cancelRemove,
    categoryHasChildrenMessage,
    clearFilters,
    confirmCategory,
    confirmCategoryHasChildren,
    confirmCategoryId,
    confirmRemoveAction,
    confirmRootReorder,
    data,
    dragSourceId,
    dragTargetId,
    error,
    filteredRoots,
    hasActiveFilters,
    handleRootDragOver,
    handleRootDragStart,
    handleRootDrop,
    loadErrorMessage,
    localFilters,
    normalizedKeyword,
    pagedRoots,
    pending,
    pendingReorder,
    refresh,
    requestRemove,
    resetDragState,
    restoreCategory,
    roots,
    statusTone,
    summaryStats,
    toggleCategory,
    totalChildren,
    ...pagination,
  };
};

export type CategoryIndexPageState = Awaited<ReturnType<typeof useCategoryIndexPage>>;
