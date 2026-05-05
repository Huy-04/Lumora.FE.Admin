export const useWarehouseIndexPage = async () => {
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { warehouseCodeOptions } = useInventoryOptions();

  const canReadWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));
  const canCreateWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseCreateAll));

  const actionPending = ref("");
  const actionError = ref("");
  const actionSuccess = ref("");
  const createWarehouseOpen = ref(false);

  const warehouseForm = reactive({
    code: "1",
    name: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    phoneNational: "",
  });

  const { data, pending, error, refresh } = await useAsyncData(
    "warehouse-admin:index",
    async () => {
      if (!canReadWarehouse.value) return [];
      return await inventoryApi.getWarehouses();
    },
  );

  const warehouses = computed(() => data.value ?? []);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "Warehouse data is not available right now."));

  const summaryStats = computed(() => [
    {
      label: "Total warehouses",
      value: `${warehouses.value.length}`,
      detail: "Admin-managed warehouse records.",
    },
  ]);

  const createWarehouse = async () => {
    actionPending.value = "create-warehouse";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await inventoryApi.createWarehouse({
        ...warehouseForm,
        code: Number(warehouseForm.code),
      });
      actionSuccess.value = "Warehouse created.";
      warehouseForm.name = "";
      warehouseForm.province = "";
      warehouseForm.district = "";
      warehouseForm.ward = "";
      warehouseForm.street = "";
      warehouseForm.phoneNational = "";
      createWarehouseOpen.value = false;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to create warehouse.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    canCreateWarehouse,
    canReadWarehouse,
    createWarehouse,
    createWarehouseOpen,
    error,
    loadErrorMessage,
    pending,
    refresh,
    summaryStats,
    warehouseCodeOptions,
    warehouseForm,
    warehouses,
  };
};

export type WarehouseIndexPageState = Awaited<ReturnType<typeof useWarehouseIndexPage>>;
