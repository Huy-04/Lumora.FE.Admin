import type { CreateInventoryRequest } from "~/features/inventory/types";

export const useInventoryIndexPage = async () => {
  const inventoryApi = useInventoryAdminApi();
  const authz = useAdminAuthorization();
  const { warehouseCodeOptions } = useInventoryOptions();

  const canReadInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryReadAll));
  const canCreateInventory = computed(() => authz.can(ADMIN_PERMISSION.inventoryCreateAll));

  const actionPending = ref("");
  const actionError = ref("");
  const actionSuccess = ref("");
  const createInventoryOpen = ref(false);
  const inventoryPage = ref(1);
  const inventoryPageSize = ref("20");

  const inventoryForm = reactive<CreateInventoryRequest>({
    productVariantId: "",
  });



  const { data, pending, error, refresh } = await useAsyncData(
    () => `inventory-admin:index:${inventoryPage.value}:${inventoryPageSize.value}`,
    async () => {
      const inventories = canReadInventory.value ? await inventoryApi.getInventories(inventoryPage.value, Number(inventoryPageSize.value)) : null;

      return {
        inventories,
      };
    },
  );

  const inventories = computed(() => data.value?.inventories?.items ?? []);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "Inventory data is not available right now."));
  const totalInventories = computed(() => data.value?.inventories?.totalCount ?? 0);
  const inventoryTotalPages = computed(() => Math.max(1, Math.ceil(totalInventories.value / Number(inventoryPageSize.value))));
  const inventoryPageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];
  const firstInventoryNumber = computed(() => totalInventories.value === 0 ? 0 : (inventoryPage.value - 1) * Number(inventoryPageSize.value) + 1);
  const lastInventoryNumber = computed(() => Math.min(inventoryPage.value * Number(inventoryPageSize.value), totalInventories.value));

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

  const createInventory = async () => {
    if (!inventoryForm.productVariantId.trim()) {
      actionError.value = "Product variant id is required.";
      return;
    }

    actionPending.value = "create-inventory";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      const created = await inventoryApi.createInventory({
        productVariantId: inventoryForm.productVariantId.trim(),
      });
      actionSuccess.value = `Inventory created for SKU ${created.sku}.`;
      inventoryForm.productVariantId = "";
      createInventoryOpen.value = false;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to create inventory.");
    } finally {
      actionPending.value = "";
    }
  };



  const goToPreviousInventoryPage = () => {
    if (inventoryPage.value <= 1) {
      return;
    }

    inventoryPage.value -= 1;
  };

  const goToNextInventoryPage = () => {
    if (inventoryPage.value >= inventoryTotalPages.value) {
      return;
    }

    inventoryPage.value += 1;
  };

  watch(inventoryPageSize, () => {
    inventoryPage.value = 1;
  });

  return {
    actionError,
    actionPending,
    actionSuccess,
    canCreateInventory,
    canReadInventory,
    createInventory,
    createInventoryOpen,
    error,
    firstInventoryNumber,
    goToNextInventoryPage,
    goToPreviousInventoryPage,
    inventories,
    inventoryForm,
    inventoryPage,
    inventoryPageSize,
    inventoryPageSizeOptions,
    inventoryTotalPages,
    lastInventoryNumber,
    loadErrorMessage,
    pending,
    refresh,
    summaryStats,
    totalInventories,
    warehouseCodeOptions,
  };
};

export type InventoryIndexPageState = Awaited<ReturnType<typeof useInventoryIndexPage>>;
