import type { InventoryResponse } from "~/features/inventory/types";

export const useInventoryDetailPage = async () => {
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { stockStatusOptions } = useInventoryOptions();
  const inventoryId = computed(() => String(route.params.id ?? ""));

  const canUpdateInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryUpdateAll));
  const canRemoveInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryRemoveAll));

  const actionPending = ref("");
  const actionError = ref("");
  const actionSuccess = ref("");
  const removeConfirmOpen = ref(false);

  const addStockForm = reactive({
    warehouseId: "",
    quantity: "",
    lowStockThreshold: "",
  });

  const stockActionForm = reactive({
    warehouseId: "",
    delta: "",
    status: "0",
    threshold: "",
  });

  const { data, pending, error, refresh } = await useAsyncData(
    () => `inventory:${inventoryId.value}`,
    () => inventoryApi.getInventoryById(inventoryId.value),
  );

  const inventory = computed<InventoryResponse | null>(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This inventory record is not available right now."));

  const setStockActionWarehouse = (warehouseId: string) => {
    stockActionForm.warehouseId = warehouseId;
    const stock = inventory.value?.stocks.find((entry) => entry.warehouseId === warehouseId);
    stockActionForm.status = stockStatusOptions.find((entry) => entry.label === stock?.status)?.value ?? "0";
    stockActionForm.threshold = stock?.lowStockThreshold === undefined || stock.lowStockThreshold === null
      ? ""
      : String(stock.lowStockThreshold);
  };

  const addStock = async () => {
    actionPending.value = "add-stock";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      data.value = await inventoryApi.addStock(inventoryId.value, {
        warehouseId: addStockForm.warehouseId,
        quantity: Number(addStockForm.quantity),
        lowStockThreshold: addStockForm.lowStockThreshold === "" ? null : Number(addStockForm.lowStockThreshold),
      });
      actionSuccess.value = "Stock row added.";
      addStockForm.warehouseId = "";
      addStockForm.quantity = "";
      addStockForm.lowStockThreshold = "";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to add stock.");
    } finally {
      actionPending.value = "";
    }
  };

  const adjustQuantity = async () => {
    actionPending.value = "adjust-quantity";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      data.value = await inventoryApi.adjustQuantity(inventoryId.value, {
        warehouseId: stockActionForm.warehouseId,
        delta: Number(stockActionForm.delta),
      });
      actionSuccess.value = "Stock quantity adjusted.";
      stockActionForm.delta = "";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to adjust stock quantity.");
    } finally {
      actionPending.value = "";
    }
  };

  const setStockStatus = async () => {
    actionPending.value = "set-status";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      data.value = await inventoryApi.setStockStatus(inventoryId.value, {
        warehouseId: stockActionForm.warehouseId,
        status: Number(stockActionForm.status),
      });
      actionSuccess.value = "Stock status updated.";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update stock status.");
    } finally {
      actionPending.value = "";
    }
  };

  const setLowStockThreshold = async () => {
    actionPending.value = "set-threshold";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      data.value = await inventoryApi.setLowStockThreshold(inventoryId.value, {
        warehouseId: stockActionForm.warehouseId,
        threshold: stockActionForm.threshold === "" ? null : Number(stockActionForm.threshold),
      });
      actionSuccess.value = "Low-stock threshold updated.";
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update low-stock threshold.");
    } finally {
      actionPending.value = "";
    }
  };

  const removeInventory = async () => {
    actionPending.value = "remove-inventory";
    actionError.value = "";
    actionSuccess.value = "";

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

  return {
    actionError,
    actionPending,
    actionSuccess,
    addStock,
    addStockForm,
    adjustQuantity,
    canRemoveInventory,
    canUpdateInventory,
    error,
    inventory,
    loadErrorMessage,
    pending,
    refresh,
    removeConfirmOpen,
    removeInventory,
    setLowStockThreshold,
    setStockActionWarehouse,
    setStockStatus,
    stockActionForm,
    stockStatusOptions,
  };
};

export type InventoryDetailPageState = Awaited<ReturnType<typeof useInventoryDetailPage>>;
