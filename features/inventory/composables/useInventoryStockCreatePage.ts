export const useInventoryStockCreatePage = async () => {
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { parseOptionalNumber, parseRequiredInt } = useNumericForm();

  const inventoryId = computed(() => String(route.params.id ?? ""));
  const requestedWarehouseId = computed(() =>
    String(route.params.warehouseId ?? route.query.warehouseId ?? ""),
  );
  const canUpdateInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryUpdateAll));
  const canReadWarehouses = computed(() => authz.can(ADMIN_PERMISSION.warehouseReadAll));

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

  const { data, pending: inventoryPending, error: inventoryError } = await useAsyncData(
    () => `inventory-stock-create:${inventoryId.value}`,
    async () => {
      const [inventory, warehouses] = await Promise.all([
        inventoryApi.getInventoryById(inventoryId.value),
        canReadWarehouses.value ? inventoryApi.getWarehouses() : Promise.resolve([]),
      ]);

      return {
        inventory,
        warehouses,
      };
    },
  );

  const inventory = computed(() => data.value?.inventory ?? null);
  const warehouses = computed(() => data.value?.warehouses ?? []);
  const attachedWarehouseIds = computed(() =>
    new Set(inventory.value?.stocks.map((stock) => stock.warehouseId) ?? []),
  );
  const selectedStock = computed(() =>
    inventory.value?.stocks.find((stock) => stock.warehouseId === form.warehouseId) ?? null,
  );
  const selectedWarehouse = computed(() =>
    warehouses.value.find((warehouse) => warehouse.id === form.warehouseId) ?? null,
  );
  const selectedWarehouseActive = computed(() => selectedWarehouse.value?.status === "Active");
  const isExistingStockMode = computed(() => selectedStock.value !== null);
  const warehouseOptions = computed(() =>
    warehouses.value
      .filter((warehouse) =>
        warehouse.id === requestedWarehouseId.value
        || (warehouse.status === "Active" && !attachedWarehouseIds.value.has(warehouse.id)),
      )
      .map((warehouse) => ({
        label: warehouse.status === "Active" ? warehouse.name : `${warehouse.name} (Inactive)`,
        value: warehouse.id,
      })),
  );
  const canAddStock = computed(() =>
    canUpdateInventory.value
    && canReadWarehouses.value
    && form.warehouseId.length > 0
    && selectedWarehouseActive.value,
  );

  const parsePositiveInt = (value: string, label: string) => {
    const parsed = parseRequiredInt(value, label);
    if (parsed <= 0) {
      throw new Error(`${label} must be greater than 0.`);
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
    if (!canAddStock.value) {
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
          reorderPoint: parseOptionalNumber(form.reorderPoint, "Reorder point"),
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
    if (!canAddStock.value || !isExistingStockMode.value) {
      return;
    }

    reorderPointPending.value = true;
    reorderPointErrorMessage.value = "";

    try {
      const updatedInventory = await inventoryApi.setReorderPoint(inventoryId.value, {
        warehouseId: form.warehouseId,
        reorderPoint: parseOptionalNumber(form.reorderPoint, "Reorder point"),
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

  return {
    canAddStock,
    canReadWarehouses,
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
    warehouseOptions,
  };
};

export type InventoryStockCreatePage = Awaited<ReturnType<typeof useInventoryStockCreatePage>>;
