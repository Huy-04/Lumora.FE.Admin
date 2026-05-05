export const useWarehouseDetailPage = async () => {
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const warehouseId = computed(() => String(route.params.id ?? ""));

  const canUpdateWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseUpdateAll));

  const actionPending = ref("");
  const actionError = ref("");
  const actionSuccess = ref("");
  const ghnShopId = ref("");

  const { data, pending, error, refresh } = await useAsyncData(
    () => `warehouse:${warehouseId.value}`,
    () => inventoryApi.getWarehouseById(warehouseId.value),
  );

  const warehouse = computed(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This warehouse is not available right now."));

  const form = reactive({
    name: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    phoneNational: "",
  });

  watchEffect(() => {
    if (!warehouse.value) {
      return;
    }

    form.name = warehouse.value.name;
    form.province = warehouse.value.province;
    form.district = warehouse.value.district;
    form.ward = warehouse.value.ward;
    form.street = warehouse.value.street;
    form.phoneNational = warehouse.value.phoneNational;
  });

  const updateWarehouse = async () => {
    actionPending.value = "update";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      data.value = await inventoryApi.updateWarehouse(warehouseId.value, { ...form });
      actionSuccess.value = "Warehouse updated.";
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
    actionSuccess.value = "";

    try {
      data.value = warehouse.value.status === "Active"
        ? await inventoryApi.deactivateWarehouse(warehouseId.value)
        : await inventoryApi.activateWarehouse(warehouseId.value);
      actionSuccess.value = "Warehouse status updated.";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update warehouse status.");
    } finally {
      actionPending.value = "";
    }
  };

  const syncGhnStore = async () => {
    if (!ghnShopId.value.trim()) {
      actionError.value = "GHN shop id is required.";
      return;
    }

    actionPending.value = "sync-ghn";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      data.value = await inventoryApi.syncWarehouseGhnStore(warehouseId.value, { ghnShopId: Number(ghnShopId.value) });
      actionSuccess.value = "GHN store snapshot synced.";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to sync GHN store.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    canUpdateWarehouse,
    error,
    form,
    ghnShopId,
    loadErrorMessage,
    pending,
    refresh,
    syncGhnStore,
    toggleWarehouse,
    updateWarehouse,
    warehouse,
  };
};

export type WarehouseDetailPageState = Awaited<ReturnType<typeof useWarehouseDetailPage>>;
