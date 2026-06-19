export const useWarehouseIndexPage = async () => {
  // 1. Dependency injection
  const warehouseApi = useWarehouseAdminApi();
  const authz = useAdminAuthorization();
  const route = useRoute();
  const router = useRouter();

  // 2. Permissions
  const canReadWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));
  const canCreateWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseCreateAll));
  const canRemoveWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseRemoveAll));

  // 3. Options
  const warehouseStatusOptions = [
    { label: "All statuses", value: "" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  // 4. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  const initialPage = Number(route.query.page) || 1;
  const initialPageSize = (route.query.pageSize as string) || "20";
  if (initialPage > 1) pagination.page.value = initialPage;
  if (initialPageSize !== "20") pagination.pageSize.value = initialPageSize;

  // 5. Filters with URL persistence
  const initialKeyword = (route.query.keyword as string) || "";
  const initialStatus = (route.query.status as string) || "";

  const { localFilters, appliedFilters, applyFilters: baseApplyFilters, clearFilters: baseClearFilters, hasActiveFilters } =
    useFilters(
      { keyword: initialKeyword, statusFilter: initialStatus },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // Sync filters to URL query string
  const syncFiltersToUrl = () => {
    const query: Record<string, string | undefined> = {};
    if (appliedFilters.keyword.value) query.keyword = appliedFilters.keyword.value;
    if (appliedFilters.statusFilter.value) query.status = appliedFilters.statusFilter.value;
    if (pagination.page.value > 1) query.page = String(pagination.page.value);
    if (pagination.pageSize.value !== "20") query.pageSize = pagination.pageSize.value;
    router.replace({ query });
  };

  const applyFilters = () => {
    baseApplyFilters();
    syncFiltersToUrl();
  };

  const clearFilters = () => {
    baseClearFilters();
    syncFiltersToUrl();
  };

  // 6. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `warehouse-admin:index:${appliedFilters.keyword.value || "all"}:${appliedFilters.statusFilter.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    async () => {
      if (!canReadWarehouse.value) {
        return {
          items: [],
          totalCount: 0,
          page: pagination.page.value,
          size: Number(pagination.pageSize.value),
          totalPages: 1,
        };
      }

      return await warehouseApi.searchWarehouses({
        keyword: appliedFilters.keyword.value || undefined,
        status: appliedFilters.statusFilter.value || undefined,
        page: pagination.page.value,
        size: Number(pagination.pageSize.value),
      });
    },
  );

  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const warehouses = computed(() => data.value?.items ?? []);

  // Sync pagination changes to URL
  watch([() => pagination.page.value, () => pagination.pageSize.value], () => {
    syncFiltersToUrl();
  });

  // 7. Computed derivations
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "Warehouse data is not available right now."));

  const summaryStats = computed(() => [
    {
      label: "Total warehouses",
      value: `${totalItems.value}`,
      detail: hasActiveFilters.value
        ? "Warehouse records matching the current backend search."
        : "Admin-managed warehouse records.",
    },
  ]);

  // 8. Actions
  const actionError = ref("");
  const actionPending = ref("");

  const removeWarehouse = async (warehouseId: string) => {
    actionError.value = "";
    actionPending.value = warehouseId;
    try {
      await warehouseApi.removeWarehouse(warehouseId);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Could not remove warehouse. Please try again.");
    } finally {
      actionPending.value = "";
    }
  };

  // 9. Return
  return {
    actionError,
    actionPending,
    applyFilters,
    canCreateWarehouse,
    canReadWarehouse,
    canRemoveWarehouse,
    clearFilters,
    error,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    pagedWarehouses: warehouses,
    pending,
    refresh,
    removeWarehouse,
    summaryStats,
    warehouseStatusOptions,
    warehouses,
    ...pagination,
  };
};

export type WarehouseIndexPageState = Awaited<ReturnType<typeof useWarehouseIndexPage>>;
