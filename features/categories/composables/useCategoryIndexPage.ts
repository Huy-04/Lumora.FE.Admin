import type { CategoryTreeNodeResponse } from "~/features/categories/types/categories";
import type { CategoryResponse } from "~/features/categories/types/categories";

type CategoryRootRow = CategoryResponse & {
  children: CategoryTreeNodeResponse[];
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

  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "", activeFilter: "" },
      { onApply: () => { pagination.page.value = 1; } },
    );

  const { data, pending, error, refresh } = await useAsyncData(
    () => `categories:roots:${appliedFilters.keyword.value || "all"}:${appliedFilters.activeFilter.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    async () => {
      const isActiveFilter = appliedFilters.activeFilter.value === ""
        ? undefined
        : appliedFilters.activeFilter.value === "true";

      const [list, tree] = await Promise.all([
        categoryApi.searchCategories({
          keyword: appliedFilters.keyword.value || undefined,
          isActive: isActiveFilter,
          level: 0,
          page: pagination.page.value,
          size: Number(pagination.pageSize.value),
        }),
        categoryApi.getAllCategoryTree(),
      ]);

      return {
        list,
        tree,
      };
    },
  );

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useCatalogRealtime((notification) => {
    if (notification.entity === "category") {
      realtimeRefresh.scheduleRefresh();
    }
  });

  const treeRoots = computed(() =>
    [...(data.value?.tree ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
  );

  const treeNodeById = computed(() =>
    new Map(treeRoots.value.map((node) => [node.id, node])),
  );

  const roots = computed<CategoryRootRow[]>(() =>
    (data.value?.list.items ?? []).map((root) => ({
      ...root,
      children: treeNodeById.value.get(root.id)?.children ?? [],
    })),
  );

  watch(() => data.value?.list.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const filteredRoots = roots;
  const pagedRoots = roots;

  const canDragRoots = computed(() =>
    canReorderCategory.value
    && !appliedFilters.keyword.value.trim()
    && !appliedFilters.activeFilter.value
    && roots.value.length === totalItems.value
    && roots.value.every((root) => !root.isDeleted),
  );

  const totalChildren = computed(() =>
    treeRoots.value.reduce((sum, root) => sum + root.children.length, 0),
  );

  const activeChildCount = (root: CategoryTreeNodeResponse) =>
    root.children.filter((child) => child.isActive && !child.isDeleted).length;

  const summaryStats = computed(() => [
      {
        label: "Visible roots",
        value: `${roots.value.length}`,
        detail: appliedFilters.keyword.value.trim() || appliedFilters.activeFilter.value
          ? "Root categories matching the current view filters."
          : "Root categories available in the catalog tree.",
      },
      {
        label: "All roots",
        value: `${totalItems.value}`,
        detail: "Top-level entry points reported by the admin list contract.",
      },
    {
      label: "Child categories",
      value: `${totalChildren.value}`,
      detail: "Managed from each root detail page instead of the index.",
    },
      {
        label: "Active roots",
        value: `${treeRoots.value.filter((root) => root.isActive && !root.isDeleted).length}`,
        detail: "Roots currently visible to storefront flows.",
      },
  ]);

  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The category module is unavailable."));

  const statusTone = (category: CategoryTreeNodeResponse) => {
    if (category.isDeleted) return "danger";
    return category.isActive ? "success" : "warning";
  };

  const categoryActions = useCategoryIndexActions(
    categoryApi,
    roots,
    data,
    canDragRoots,
    refresh,
  );

  return {
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
    clearFilters,
    data,
    error,
    filteredRoots,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    pagedRoots,
    pending,
    refresh,
    roots,
    statusTone,
    summaryStats,
    totalChildren,
    ...categoryActions,
    ...pagination,
  };
};

export type CategoryIndexPageState = Awaited<ReturnType<typeof useCategoryIndexPage>>;
