import type { InventoryResponse } from "~/features/inventory/types";

export const useInventoryDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { stockStatusOptions } = useInventoryOptions();

  type InventoryTab = "overview" | "stock";

  const inventoryId = computed(() => String(route.params.id ?? ""));

  // 2. Permissions
  const canUpdateInventory = computed(() => authz.canUpdateAnyInventoryStock());
  const canRemoveInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryRemoveAll));
  const canReadWarehouses = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));

  // 3. Data fetching
  const actionPending = ref("");
  const actionError = ref("");
  const removeConfirmOpen = ref(false);

  const stockActionForm = reactive({
    warehouseId: "",
    delta: "",
    status: "0",
    reorderPoint: "",
  });

  const { data, pending, error, refresh } = await useAsyncData(
    () => `inventory-detail:${inventoryId.value}`,
    async () => {
      const inventory = await inventoryApi.getInventoryById(inventoryId.value);
      let warehouses = [] as Awaited<ReturnType<typeof inventoryApi.getWarehouses>>;
      let warehouseCatalogWarning = "";

      if (canReadWarehouses.value) {
        try {
          warehouses = await inventoryApi.getWarehouses();
        } catch (requestError) {
          warehouseCatalogWarning = getProblemMessage(
            requestError,
            "Warehouse catalog is unavailable right now. Stock details still work, but warehouse labels may be limited.",
          );
        }
      }

      return { inventory, warehouseCatalogWarning, warehouses };
    },
  );

  // 4. Computed derivations
  const inventory = computed<InventoryResponse | null>(() => data.value?.inventory ?? null);
  const warehouses = computed(() => data.value?.warehouses ?? []);
  const warehouseCatalogWarning = computed(() => data.value?.warehouseCatalogWarning ?? "");
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This inventory record is not available right now."));
  const isNotFound = computed(() => getProblemStatus(error.value) === 404);

  const realtimeRefresh = useRealtimeRefresh(refresh);
  useCatalogRealtime((notification) => {
    if (notification.entity === "inventory" &&
      (!inventory.value?.productId || notification.entityId === inventory.value.productId)) {
      realtimeRefresh.scheduleRefresh();
    }
  }, { enabled: computed(() => Boolean(inventoryId.value)) });

  const inventoryTabs = computed<Array<{ label: string; value: InventoryTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Stock", value: "stock" },
  ]);
  const normalizeTab = (value: unknown): InventoryTab => {
    const resolved = value === "stocks" || value === "stock" || value === "operations" || value === "remove"
      ? "stock"
      : "overview";
    return inventoryTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };
  const activeTab = ref<InventoryTab>("overview");
  const warehouseNameById = (warehouseId: string) =>
    warehouses.value.find((warehouse) => warehouse.id === warehouseId)?.name ?? `Warehouse ${warehouseId}`;
  const warehouseStatusById = (warehouseId: string) =>
    warehouses.value.find((warehouse) => warehouse.id === warehouseId)?.status ?? null;
  const warehouseCodeById = (warehouseId: string) =>
    warehouses.value.find((warehouse) => warehouse.id === warehouseId)?.code ?? null;
  const canUpdateStockWarehouse = (warehouseId: string) =>
    authz.canUpdateInventoryStockForWarehouseCode(warehouseCodeById(warehouseId));
  const stockActionWarehouseOptions = computed(() =>
    inventory.value?.stocks.map((stock) => ({
      label: warehouseNameById(stock.warehouseId),
      value: stock.warehouseId,
    })) ?? [],
  );
  const applyInventoryUpdate = (nextInventory: InventoryResponse) => {
    data.value = {
      inventory: nextInventory,
      warehouseCatalogWarning: warehouseCatalogWarning.value,
      warehouses: warehouses.value,
    };
  };

  const setStockActionWarehouse = (warehouseId: string) => {
    stockActionForm.warehouseId = warehouseId;
    const stock = inventory.value?.stocks.find((entry) => entry.warehouseId === warehouseId);
    stockActionForm.status = stockStatusOptions.find((entry) => entry.label === stock?.status)?.value ?? "0";
    stockActionForm.reorderPoint = stock?.reorderPoint === undefined || stock.reorderPoint === null
      ? ""
      : String(stock.reorderPoint);
  };

  // 5. Actions/mutations
  const adjustQuantity = async () => {
    if (!stockActionForm.warehouseId) {
      actionError.value = "Select a warehouse stock row first.";
      return;
    }

    if (!canUpdateStockWarehouse(stockActionForm.warehouseId)) {
      actionError.value = "Inventory update permission for this warehouse is required.";
      return;
    }

    actionPending.value = "adjust-quantity";
    actionError.value = "";

    try {
      applyInventoryUpdate(await inventoryApi.adjustQuantity(inventoryId.value, {
        warehouseId: stockActionForm.warehouseId,
        delta: Number(stockActionForm.delta),
      }));
      stockActionForm.delta = "";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to adjust stock quantity.");
    } finally {
      actionPending.value = "";
    }
  };

  const setStockStatus = async () => {
    if (!stockActionForm.warehouseId) {
      actionError.value = "Select a warehouse stock row first.";
      return;
    }

    if (!canUpdateStockWarehouse(stockActionForm.warehouseId)) {
      actionError.value = "Inventory update permission for this warehouse is required.";
      return;
    }

    actionPending.value = "set-status";
    actionError.value = "";

    try {
      applyInventoryUpdate(await inventoryApi.setStockStatus(inventoryId.value, {
        warehouseId: stockActionForm.warehouseId,
        status: Number(stockActionForm.status),
      }));
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update stock status.");
    } finally {
      actionPending.value = "";
    }
  };

  const setReorderPoint = async () => {
    if (!stockActionForm.warehouseId) {
      actionError.value = "Select a warehouse stock row first.";
      return;
    }

    if (!canUpdateStockWarehouse(stockActionForm.warehouseId)) {
      actionError.value = "Inventory update permission for this warehouse is required.";
      return;
    }

    actionPending.value = "set-reorder-point";
    actionError.value = "";

    try {
      applyInventoryUpdate(await inventoryApi.setReorderPoint(inventoryId.value, {
        warehouseId: stockActionForm.warehouseId,
        reorderPoint: stockActionForm.reorderPoint === "" ? null : Number(stockActionForm.reorderPoint),
      }));
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update reorder point.");
    } finally {
      actionPending.value = "";
    }
  };

  const removeInventory = async () => {
    actionPending.value = "remove-inventory";
    actionError.value = "";

    try {
      await inventoryApi.removeInventory(inventoryId.value);
      await navigateTo("/inventory");
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to remove inventory.");
    } finally {
      actionPending.value = "";
      removeConfirmOpen.value = false;
    }
  };

  // 6. Watchers
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

  const selectTab = async (tab: InventoryTab) => {
    activeTab.value = normalizeTab(tab);

    await navigateTo(
      {
        path: `/inventory/${inventoryId.value}`,
        query: { tab: activeTab.value },
      },
      { replace: true },
    );
  };

  // 7. Return statement
  return {
    actionError,
    actionPending,
    activeTab,
    adjustQuantity,
    canRemoveInventory,
    canUpdateStockWarehouse,
    canUpdateInventory,
    error,
    inventory,
    inventoryTabs,
    isNotFound,
    loadErrorMessage,
    pending,
    refresh,
    removeConfirmOpen,
    removeInventory,
    setReorderPoint,
    setStockActionWarehouse,
    setStockStatus,
    selectTab,
    stockActionForm,
    stockActionWarehouseOptions,
    stockStatusOptions,
    warehouseCatalogWarning,
    warehouseNameById,
    warehouseStatusById,
    warehousesPending: pending,
  };
};

export type InventoryDetailPageState = Awaited<ReturnType<typeof useInventoryDetailPage>>;
