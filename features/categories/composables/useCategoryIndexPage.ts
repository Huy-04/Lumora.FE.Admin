import { computed, ref } from "vue";
import { useAsyncData } from "#app";
import { ADMIN_PERMISSION, useAdminAuthorization } from "~/features/auth/composables/useAdminAuthorization";
import { useCategoryAdminApi } from "~/features/categories/composables/useCategoryAdminApi";
import { getProblemDetails, getProblemMessage } from "~/Shared/api/apiErrors";
import type { CategoryTreeNodeResponse } from "~/features/categories/types";

type ReorderItem = {
  categoryId: string;
  sortOrder: number;
};

export const useCategoryIndexPage = async () => {
  const categoryApi = useCategoryAdminApi();
  const authz = useAdminAuthorization();

  const canCreateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryCreateAll));
  const canUpdateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryUpdateAll));
  const canDeleteCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeleteAll));
  const canActivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryActivateAll));
  const canDeactivateCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryDeactivateAll));
  const canReorderCategory = computed(() => authz.can(ADMIN_PERMISSION.categoryReorderAll));
  const canRestoreCategory = canDeleteCategory;

  const localKeyword = ref("");
  const localActiveFilter = ref("");
  const keyword = ref("");
  const activeFilter = ref("");

  const applyFilters = () => {
    keyword.value = localKeyword.value;
    activeFilter.value = localActiveFilter.value;
  };

  const clearFilters = () => {
    localKeyword.value = "";
    localActiveFilter.value = "";
    keyword.value = "";
    activeFilter.value = "";
  };

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

  const { data, pending, error, refresh } = await useAsyncData(
    "categories:all:admin",
    () => categoryApi.getAllCategoryTree(),
  );

  const roots = computed(() =>
    [...(data.value ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
  );

  const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase());
  const canDragRoots = computed(() =>
    canReorderCategory.value
    && !normalizedKeyword.value
    && !activeFilter.value
    && roots.value.every((root) => !root.isDeleted),
  );

  const filteredRoots = computed(() =>
    roots.value.filter((root) => {
      const matchesKeyword = !normalizedKeyword.value
        || root.name.toLowerCase().includes(normalizedKeyword.value)
        || root.slug.toLowerCase().includes(normalizedKeyword.value);

      const matchesStatus = activeFilter.value === ""
        || String(root.isActive) === activeFilter.value;

      return matchesKeyword && matchesStatus;
    }),
  );

  const totalChildren = computed(() =>
    roots.value.reduce((sum, root) => sum + root.children.length, 0),
  );

  const page = ref(1);
  const pageSize = ref("20");
  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const totalCategories = computed(() => filteredRoots.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalCategories.value / Number(pageSize.value))));
  const firstItemNumber = computed(() => totalCategories.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalCategories.value));
  const pagedRoots = computed(() => {
    const start = (page.value - 1) * Number(pageSize.value);
    return filteredRoots.value.slice(start, start + Number(pageSize.value));
  });
  const goToNextPage = () => { if (page.value < totalPages.value) page.value += 1; };
  const goToPreviousPage = () => { if (page.value > 1) page.value -= 1; };

  watch([() => keyword.value, () => activeFilter.value, pageSize], () => { page.value = 1; });

  const activeChildCount = (root: CategoryTreeNodeResponse) =>
    root.children.filter((child) => child.isActive && !child.isDeleted).length;

  const summaryStats = computed(() => [
    {
      label: "Visible roots",
      value: `${filteredRoots.value.length}`,
      detail: normalizedKeyword.value || activeFilter.value
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

    try {
      await categoryApi.reorderCategories({
        items: pendingReorder.value.items,
      });

      pendingReorder.value = null;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to reorder categories.");
    } finally {
      actionPending.value = "";
      actionTargetId.value = "";
    }
  };

  return {
    localKeyword,
    localActiveFilter,
    keyword,
    activeFilter,
    applyFilters,
    clearFilters,
    confirmCategoryId,
    actionPending,
    actionTargetId,
    actionError,
    dragSourceId,
    dragTargetId,
    pendingReorder,
    data,
    pending,
    error,
    refresh,
    roots,
    normalizedKeyword,
    canDragRoots,
    filteredRoots,
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    lastItemNumber,
    page,
    pageSize,
    pageSizeOptions,
    pagedRoots,
    activeChildCount,
    summaryStats,
    confirmCategory,
    confirmCategoryHasChildren,
    categoryHasChildrenMessage,
    requestRemove,
    cancelRemove,
    confirmRemoveAction,
    restoreCategory,
    toggleCategory,
    statusTone,
    resetDragState,
    handleRootDragStart,
    handleRootDragOver,
    handleRootDrop,
    confirmRootReorder,
    canCreateCategory,
    canUpdateCategory,
    canDeleteCategory,
    canActivateCategory,
    canDeactivateCategory,
    canRestoreCategory,
    canReorderCategory,
    getProblemMessage,
    totalCategories,
    totalPages,
  };
};

export type CategoryIndexPage = Awaited<ReturnType<typeof useCategoryIndexPage>>;
