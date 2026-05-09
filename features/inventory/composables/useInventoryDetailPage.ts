import type { InventoryResponse } from "~/features/inventory/types";

export const useInventoryDetailPage = async () => {
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { stockStatusOptions } = useInventoryOptions();

  type InventoryTab = "overview" | "stock" | "remove";

  const inventoryId = computed(() => String(route.params.id ?? ""));

  const canUpdateInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryUpdateAll));
  const canRemoveInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryRemoveAll));
  const canReadWarehouses = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));

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
      const warehouses = canReadWarehouses.value
        ? await inventoryApi.getWarehouses()
        : [];

      return { inventory, warehouses };
    },
  );

  const inventory = computed<InventoryResponse | null>(() => data.value?.inventory ?? null);
  const warehouses = computed(() => data.value?.warehouses ?? []);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This inventory record is not available right now."));
  const inventoryTabs = computed<Array<{ label: string; value: InventoryTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Stock", value: "stock" },
    ...(canRemoveInventory.value ? [{ label: "Remove", value: "remove" as const }] : []),
  ]);
  const normalizeTab = (value: unknown): InventoryTab => {
    const resolved = value === "stocks" || value === "stock" || value === "operations"
      ? "stock"
      : value === "remove"
        ? "remove"
        : "overview";
    return inventoryTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };
  const activeTab = ref<InventoryTab>("overview");
  const warehouseNameById = (warehouseId: string) =>
    warehouses.value.find((warehouse) => warehouse.id === warehouseId)?.name ?? "Unknown warehouse";
  const warehouseStatusById = (warehouseId: string) =>
    warehouses.value.find((warehouse) => warehouse.id === warehouseId)?.status ?? null;
  const warehouseOptions = computed(() =>
    warehouses.value.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse.id,
    })),
  );
  const stockActionWarehouseOptions = computed(() =>
    inventory.value?.stocks.map((stock) => ({
      label: warehouseNameById(stock.warehouseId),
      value: stock.warehouseId,
    })) ?? [],
  );
  const applyInventoryUpdate = (nextInventory: InventoryResponse) => {
    data.value = {
      inventory: nextInventory,
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

  const adjustQuantity = async () => {
    if (!stockActionForm.warehouseId) {
      actionError.value = "Select a warehouse stock row first.";
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

  return {
    actionError,
    actionPending,
    activeTab,
    adjustQuantity,
    canRemoveInventory,
    canUpdateInventory,
    error,
    inventory,
    inventoryTabs,
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
    warehouseNameById,
    warehouseStatusById,
    warehousesPending: pending,
  };
};

export type InventoryDetailPageState = Awaited<ReturnType<typeof useInventoryDetailPage>>;
