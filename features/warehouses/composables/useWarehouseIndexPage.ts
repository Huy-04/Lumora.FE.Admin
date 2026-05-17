export const useWarehouseIndexPage = async () => {
  // 1. Dependency injection
  const inventoryApi = useInventoryAdminApi();
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

  // 4. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    "warehouse-admin:index",
    async () => {
      if (!canReadWarehouse.value) return [];
      return await inventoryApi.getWarehouses();
    },
  );

  const allWarehouses = computed(() => data.value ?? []);

  // 5. Filters (client-side filtering with URL persistence)
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

  // 6. Filtered results
  const warehouses = computed(() => {
    let result = allWarehouses.value;

    const kw = appliedFilters.keyword.value.trim().toLowerCase();
    if (kw) {
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(kw) ||
          w.address.toLowerCase().includes(kw),
      );
    }

    if (appliedFilters.statusFilter.value) {
      result = result.filter((w) => w.status === appliedFilters.statusFilter.value);
    }

    return result;
  });

  // 7. Pagination (client-side with URL persistence)
  const totalItems = computed(() => warehouses.value.length);
  const pagination = usePagination(totalItems);

  // Initialize pagination from URL
  const initialPage = Number(route.query.page) || 1;
  const initialPageSize = (route.query.pageSize as string) || "20";
  if (initialPage > 1) pagination.page.value = initialPage;
  if (initialPageSize !== "20") pagination.pageSize.value = initialPageSize;

  // Sync pagination changes to URL
  watch([() => pagination.page.value, () => pagination.pageSize.value], () => {
    syncFiltersToUrl();
  });

  const pagedWarehouses = computed(() => {
    const start = (pagination.page.value - 1) * Number(pagination.pageSize.value);
    const end = start + Number(pagination.pageSize.value);
    return warehouses.value.slice(start, end);
  });

  // 8. Computed derivations
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "Warehouse data is not available right now."));

  const summaryStats = computed(() => [
    {
      label: "Total warehouses",
      value: `${allWarehouses.value.length}`,
      detail: "Admin-managed warehouse records.",
    },
  ]);

  // 9. Actions
  const actionError = ref("");
  const actionPending = ref("");

  const removeWarehouse = async (warehouseId: string) => {
    actionError.value = "";
    actionPending.value = warehouseId;
    try {
      await inventoryApi.removeWarehouse(warehouseId);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Could not remove warehouse. Please try again.");
    } finally {
      actionPending.value = "";
    }
  };

  // 10. Return
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
    pagedWarehouses,
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
