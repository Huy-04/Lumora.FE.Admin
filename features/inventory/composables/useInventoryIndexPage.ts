export const useInventoryIndexPage = async () => {
  // 1. Dependency injection
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { warehouseCodeOptions, stockStatusFilterOptions } = useInventoryOptions();

  // 2. Permissions
  const canReadInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryReadAll));
  const canCreateInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryCreateAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "", stockStatus: "" },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const actionPending = ref("");
  const actionError = ref("");

  const { data, pending, error, refresh } = await useAsyncData(
    () => `inventory-admin:index:${pagination.page.value}:${pagination.pageSize.value}:${appliedFilters.keyword.value}:${appliedFilters.stockStatus.value}`,
    async () => {
      if (!canReadInventory.value) return { inventories: null };

      const hasFilters = !!(appliedFilters.keyword.value || appliedFilters.stockStatus.value);

      const inventories = hasFilters
        ? await inventoryApi.searchInventories({
            keyword: appliedFilters.keyword.value || undefined,
            stockStatus: appliedFilters.stockStatus.value ? Number(appliedFilters.stockStatus.value) : undefined,
            page: pagination.page.value,
            size: Number(pagination.pageSize.value),
          })
        : await inventoryApi.getInventories(pagination.page.value, Number(pagination.pageSize.value));

      return {
        inventories,
      };
    },
  );

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useCatalogRealtime((notification) => {
    if (notification.entity === "inventory") {
      realtimeRefresh.scheduleRefresh();
    }
  }, { enabled: canReadInventory });

  // 6. Computed derivations
  watch(() => data.value?.inventories?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const inventories = computed(() => data.value?.inventories?.items ?? []);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "Inventory data is not available right now."));
  const totalInventories = computed(() => data.value?.inventories?.totalCount ?? 0);

  const summaryStats = computed(() => [
    {
      label: "Inventory rows",
      value: `${totalInventories.value}`,
      detail: "Product variants with inventory records.",
    },
    {
      label: "Available units",
      value: `${inventories.value.reduce((total, item) => total + item.totalAvailableQuantity, 0)}`,
      detail: "Available units in the current result set.",
    },
    {
      label: "Reserved units",
      value: `${inventories.value.reduce((total, item) => total + item.totalReservedQuantity, 0)}`,
      detail: "Reserved units in the current result set.",
    },
  ]);

  // 7. Actions/mutations

  // 8. Watchers
  // (pagination reset on filter apply and pageSize change handled by usePagination and useFilters)

  // 9. Return statement
  return {
    actionError,
    actionPending,
    applyFilters,
    canCreateInventory,
    canReadInventory,
    clearFilters,
    error,
    hasActiveFilters,
    inventories,
    loadErrorMessage,
    localFilters,
    pending,
    refresh,
    stockStatusFilterOptions,
    summaryStats,
    totalInventories,
    warehouseCodeOptions,
    ...pagination,
  };
};

export type InventoryIndexPageState = Awaited<ReturnType<typeof useInventoryIndexPage>>;
