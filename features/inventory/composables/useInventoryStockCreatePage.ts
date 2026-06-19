export const useInventoryStockCreatePage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const warehouseApi = useWarehouseAdminApi();
  const authz = useAdminAuthorization();
  const { parseRequiredInt } = useNumericForm();

  const inventoryId = computed(() => String(route.params.id ?? ""));
  const requestedWarehouseId = computed(() =>
    String(route.params.warehouseId ?? route.query.warehouseId ?? ""),
  );
  const REORDER_POINT_MAX = 10_000;
  const QUANTITY_MAX = 999_999;

  // 2. Permissions
  const canUpdateInventory = computed(() => authz.canUpdateAnyInventoryStock());
  const canReadWarehouses = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));

  // 3. Form state
  const form = reactive({
    warehouseId: "",
    adjustmentDirection: "increase" as "increase" | "decrease",
    quantity: "",
    reorderPoint: "",
  });
  const pending = ref(false);
  const reorderPointPending = ref(false);
  const errorMessage = ref("");
  const reorderPointErrorMessage = ref("");
  const warehouseCatalogWarning = ref("");

  // 4. Data fetching
  const { data, pending: inventoryPending, error: inventoryError } = await useAsyncData(
    () => `inventory-stock-create:${inventoryId.value}`,
    async () => {
      const inventory = await inventoryApi.getInventoryById(inventoryId.value);
      let warehouses = [] as Awaited<ReturnType<typeof warehouseApi.getWarehouses>>;
      let nextWarehouseCatalogWarning = "";

      if (canReadWarehouses.value) {
        try {
          warehouses = await warehouseApi.getWarehouses();
        } catch (requestError) {
          nextWarehouseCatalogWarning = getProblemMessage(
            requestError,
            "Warehouse catalog is unavailable right now. Enter a warehouse ID manually or continue with the requested warehouse.",
          );
        }
      } else {
        nextWarehouseCatalogWarning = requestedWarehouseId.value
          ? "Warehouse catalog access is unavailable for this account. Continuing with the requested warehouse."
          : "Warehouse catalog access is unavailable for this account. Enter a warehouse ID manually.";
      }

      return {
        inventory,
        warehouseCatalogWarning: nextWarehouseCatalogWarning,
        warehouses,
      };
    },
  );

  const inventory = computed(() => data.value?.inventory ?? null);
  const warehouses = computed(() => data.value?.warehouses ?? []);
  const canUseWarehouseCatalog = computed(() =>
    canReadWarehouses.value && warehouseCatalogWarning.value.length === 0,
  );
  const attachedWarehouseIds = computed(() =>
    new Set(inventory.value?.stocks.map((stock) => stock.warehouseId) ?? []),
  );
  const selectedStock = computed(() =>
    inventory.value?.stocks.find((stock) => stock.warehouseId === form.warehouseId) ?? null,
  );
  const selectedWarehouse = computed(() =>
    warehouses.value.find((warehouse) => warehouse.id === form.warehouseId) ?? null,
  );
  const selectedWarehouseCode = computed(() => selectedWarehouse.value?.code ?? null);
  const canUpdateSelectedWarehouse = computed(() =>
    authz.canUpdateInventoryStockForWarehouseCode(selectedWarehouseCode.value),
  );
  const selectedWarehouseActive = computed(() =>
    selectedWarehouse.value ? selectedWarehouse.value.status === "Active" : true,
  );
  const isExistingStockMode = computed(() => selectedStock.value !== null);
  const warehouseOptions = computed(() =>
    warehouses.value
      .filter((warehouse) =>
        warehouse.id === requestedWarehouseId.value
        || !attachedWarehouseIds.value.has(warehouse.id),
      )
      .map((warehouse) => ({
        label: warehouse.status === "Active" ? warehouse.name : `${warehouse.name} (Inactive)`,
        value: warehouse.id,
      })),
  );
  const canAddStock = computed(() =>
    canUpdateSelectedWarehouse.value
    && form.warehouseId.length > 0
    && (!isExistingStockMode.value || selectedStock.value !== null),
  );

  watchEffect(() => {
    warehouseCatalogWarning.value = data.value?.warehouseCatalogWarning ?? "";
  });

  // 5. Actions/mutations
  const parsePositiveInt = (value: string, label: string) => {
    const parsed = parseRequiredInt(value, label);
    if (parsed <= 0) {
      throw new Error(`${label} must be greater than 0.`);
    }

    if (parsed > QUANTITY_MAX) {
      throw new Error(`${label} must be at most ${QUANTITY_MAX}.`);
    }

    return parsed;
  };

  const parseOptionalReorderPoint = (value: string, label: string) => {
    if (!String(value ?? "").trim()) {
      return null;
    }

    const parsed = parseRequiredInt(value, label);
    if (parsed <= 0) {
      throw new Error(`${label} must be greater than 0.`);
    }

    if (parsed > REORDER_POINT_MAX) {
      throw new Error(`${label} must be at most ${REORDER_POINT_MAX}.`);
    }

    return parsed;
  };

  const parseQuantityDelta = (value: string, label: string) => {
    const parsed = parsePositiveInt(value, label);
    return form.adjustmentDirection === "decrease" ? -parsed : parsed;
  };

  const parseSafeQuantityDelta = () => {
    const delta = parseQuantityDelta(form.quantity, "Quantity");
    const stock = selectedStock.value;

    if (stock && delta < 0 && Math.abs(delta) > stock.availableQuantity) {
      throw new Error(`You can reduce at most ${stock.availableQuantity} units for this warehouse.`);
    }

    return delta;
  };

  const submit = async () => {
    if (!canAddStock.value || pending.value) {
      return;
    }

    pending.value = true;
    errorMessage.value = "";

    try {
      if (isExistingStockMode.value) {
        await inventoryApi.adjustQuantity(inventoryId.value, {
          warehouseId: form.warehouseId,
          delta: parseSafeQuantityDelta(),
        });
      } else {
        await inventoryApi.addStock(inventoryId.value, {
          warehouseId: form.warehouseId,
          quantity: parsePositiveInt(form.quantity, "Quantity"),
          reorderPoint: parseOptionalReorderPoint(form.reorderPoint, "Reorder point"),
        });
      }

      await navigateTo(`/inventory/${inventoryId.value}?tab=operations`);
    } catch (requestError) {
      errorMessage.value = getProblemMessage(
        requestError,
        isExistingStockMode.value ? "Unable to adjust stock." : "Unable to add stock.",
      );
    } finally {
      pending.value = false;
    }
  };

  const setReorderPoint = async () => {
    if (!canAddStock.value || !isExistingStockMode.value || reorderPointPending.value) {
      return;
    }

    reorderPointPending.value = true;
    reorderPointErrorMessage.value = "";

    try {
      const updatedInventory = await inventoryApi.setReorderPoint(inventoryId.value, {
        warehouseId: form.warehouseId,
        reorderPoint: parseOptionalReorderPoint(form.reorderPoint, "Reorder point"),
      });

      if (data.value) {
        data.value = {
          ...data.value,
          inventory: updatedInventory,
        };
      }
    } catch (requestError) {
      reorderPointErrorMessage.value = getProblemMessage(requestError, "Unable to set reorder point.");
    } finally {
      reorderPointPending.value = false;
    }
  };

  watchEffect(() => {
    if (!form.warehouseId && requestedWarehouseId.value) {
      form.warehouseId = requestedWarehouseId.value;
    }

    if (
      selectedStock.value
      && form.reorderPoint.length === 0
      && selectedStock.value.reorderPoint !== null
      && selectedStock.value.reorderPoint !== undefined
    ) {
      form.reorderPoint = String(selectedStock.value.reorderPoint);
    }
  });

  // 6. Return statement
  return {
    canAddStock,
    canReadWarehouses,
    canUpdateSelectedWarehouse,
    canUseWarehouseCatalog,
    canUpdateInventory,
    errorMessage,
    form,
    inventory,
    inventoryError,
    inventoryId,
    inventoryPending,
    isExistingStockMode,
    pending,
    selectedStock,
    selectedWarehouseActive,
    setReorderPoint,
    submit,
    reorderPointErrorMessage,
    reorderPointPending,
    warehouseCatalogWarning,
    warehouseOptions,
  };
};

export type InventoryStockCreatePage = Awaited<ReturnType<typeof useInventoryStockCreatePage>>;
