export const useWarehouseDetailPage = async () => {
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();

  type WarehouseTab = "overview" | "edit" | "ghn-store" | "status";

  const warehouseId = computed(() => String(route.params.id ?? ""));

  const canUpdateWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseUpdateAll));

  const actionPending = ref("");
  const actionError = ref("");
  const ghnShopId = ref("");
  const activeTab = ref<WarehouseTab>("overview");

  const { data, pending, error, refresh } = await useAsyncData(
    () => `warehouse:${warehouseId.value}`,
    () => inventoryApi.getWarehouseById(warehouseId.value),
  );

  const warehouse = computed(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This warehouse is not available right now."));
  const warehouseTabs = computed<Array<{ label: string; value: WarehouseTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Edit", value: "edit" },
    { label: "GHN store", value: "ghn-store" },
    { label: "Status", value: "status" },
  ]);
  const normalizeTab = (value: unknown): WarehouseTab => {
    const resolved = value === "address" || value === "edit" || value === "operations"
      ? "edit"
      : value === "ghn-store"
        ? "ghn-store"
        : value === "status"
          ? "status"
          : "overview";
    return warehouseTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const form = reactive({
    name: "",
    address: "",
    phoneNational: "",
  });

  watchEffect(() => {
    if (!warehouse.value) {
      return;
    }

    form.name = warehouse.value.name;
    form.address = warehouse.value.address;
    form.phoneNational = warehouse.value.phoneNational;
  });

  const updateWarehouse = async () => {
    actionPending.value = "update";
    actionError.value = "";

    try {
      data.value = await inventoryApi.updateWarehouse(warehouseId.value, { ...form });
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update warehouse.");
    } finally {
      actionPending.value = "";
    }
  };

  const toggleWarehouse = async () => {
    if (!warehouse.value) {
      return;
    }

    actionPending.value = "toggle";
    actionError.value = "";

    try {
      data.value = warehouse.value.status === "Active"
        ? await inventoryApi.deactivateWarehouse(warehouseId.value)
        : await inventoryApi.activateWarehouse(warehouseId.value);
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update warehouse status.");
    } finally {
      actionPending.value = "";
    }
  };

  const syncGhnStore = async () => {
    const normalizedGhnShopId = String(ghnShopId.value).trim();

    if (!normalizedGhnShopId) {
      actionError.value = "GHN shop id is required.";
      return;
    }

    actionPending.value = "sync-ghn";
    actionError.value = "";

    try {
      data.value = await inventoryApi.syncWarehouseGhnStore(warehouseId.value, { ghnShopId: Number(normalizedGhnShopId) });
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to sync GHN store.");
    } finally {
      actionPending.value = "";
    }
  };

  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
    { immediate: true },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  const selectTab = async (tab: WarehouseTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/warehouses/${warehouseId.value}`,
        query: { tab: activeTab.value },
      },
      { replace: true },
    );
  };

  return {
    actionError,
    actionPending,
    activeTab,
    canUpdateWarehouse,
    error,
    form,
    ghnShopId,
    loadErrorMessage,
    pending,
    refresh,
    selectTab,
    syncGhnStore,
    toggleWarehouse,
    updateWarehouse,
    warehouse,
    warehouseId,
    warehouseTabs,
  };
};

export type WarehouseDetailPageState = Awaited<ReturnType<typeof useWarehouseDetailPage>>;
