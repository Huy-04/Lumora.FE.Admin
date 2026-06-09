export const useWarehouseDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const inventoryApi = useInventoryAdminApi();
  const ghnApi = useGhnApi();
  const authz = useAdminAuthorization();

  type WarehouseTab = "overview" | "edit" | "ghn-store";

  const warehouseId = computed(() => String(route.params.id ?? ""));

  // 2. Permissions
  const canUpdateWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseUpdateAll));
  const canRemoveWarehouse = computed(() => authz.can(ADMIN_PERMISSION.warehouseRemoveAll));

  // 3. Data fetching
  const actionPending = ref("");
  const actionError = ref("");
  const ghnShopId = ref("");
  const activeTab = ref<WarehouseTab>("overview");

  const { data, pending, error, refresh } = await useAsyncData(
    () => `warehouse:${warehouseId.value}`,
    () => inventoryApi.getWarehouseById(warehouseId.value),
  );

  // 4. Computed derivations
  const warehouse = computed(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This warehouse is not available right now."));
  const warehouseTabs = computed<Array<{ label: string; value: WarehouseTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Edit", value: "edit" },
    { label: "GHN store", value: "ghn-store" },
  ]);
  const normalizeTab = (value: unknown): WarehouseTab => {
    const resolved = value === "address" || value === "edit" || value === "operations" || value === "status"
      ? "edit"
      : value === "ghn-store"
        ? "ghn-store"
        : "overview";
    return warehouseTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const form = reactive({
    name: "",
    phoneNational: "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    street: "",
    manualAddress: "",
  });

  // GHN address data
  const provinces = ref<Array<{ label: string; value: string }>>([]);
  const districts = ref<Array<{ label: string; value: string }>>([]);
  const wards = ref<Array<{ label: string; value: string }>>([]);
  const provincesLoading = ref(false);
  const districtsLoading = ref(false);
  const wardsLoading = ref(false);
  const addressDirectoryError = ref("");
  const canUseAddressDirectory = computed(() => addressDirectoryError.value.length === 0);

  const switchToManualAddress = (requestError: unknown) => {
    addressDirectoryError.value = getProblemMessage(
      requestError,
      "GHN address directory is unavailable. Enter the warehouse address manually.",
    );
    form.provinceId = "";
    form.districtId = "";
    form.wardCode = "";
    districts.value = [];
    wards.value = [];
  };

  // Load provinces on mount
  provincesLoading.value = true;
  try {
    const data = await ghnApi.getProvinces();
    provinces.value = data.map((p) => ({ label: p.provinceName, value: String(p.provinceId) }));
  } catch (requestError) {
    switchToManualAddress(requestError);
  } finally {
    provincesLoading.value = false;
  }

  // Load districts when province changes
  watch(
    () => form.provinceId,
    async (provinceId) => {
      form.districtId = "";
      form.wardCode = "";
      districts.value = [];
      wards.value = [];

      if (!provinceId) return;

      districtsLoading.value = true;
      try {
        const data = await ghnApi.getDistricts(Number(provinceId));
        districts.value = data.map((d) => ({ label: d.districtName, value: String(d.districtId) }));
      } catch (requestError) {
        switchToManualAddress(requestError);
      } finally {
        districtsLoading.value = false;
      }
    },
  );

  // Load wards when district changes
  watch(
    () => form.districtId,
    async (districtId) => {
      form.wardCode = "";
      wards.value = [];

      if (!districtId) return;

      wardsLoading.value = true;
      try {
        const data = await ghnApi.getWards(Number(districtId));
        wards.value = data.map((w) => ({ label: w.wardName, value: w.wardCode }));
      } catch (requestError) {
        switchToManualAddress(requestError);
      } finally {
        wardsLoading.value = false;
      }
    },
  );

  // Build full address string from selected names
  const fullAddress = computed(() => {
    if (!canUseAddressDirectory.value) {
      return form.manualAddress.trim();
    }

    const provinceName = provinces.value.find((p) => p.value === form.provinceId)?.label ?? "";
    const districtName = districts.value.find((d) => d.value === form.districtId)?.label ?? "";
    const wardName = wards.value.find((w) => w.value === form.wardCode)?.label ?? "";

    const parts = [form.street, wardName, districtName, provinceName].filter(Boolean);
    return parts.join(", ");
  });

  watchEffect(() => {
    if (!warehouse.value) {
      return;
    }

    form.name = warehouse.value.name;
    form.phoneNational = warehouse.value.phoneNational;
    form.manualAddress = warehouse.value.address;
  });

  // 5. Actions/mutations
  const updateWarehouse = async () => {
    const normalizedManualAddress = form.manualAddress.trim();
    const hasAddressInput = Boolean(
      form.street.trim()
      || form.provinceId
      || form.districtId
      || form.wardCode,
    );
    const hasCompleteAddress = Boolean(
      form.street.trim()
      && form.provinceId
      && form.districtId
      && form.wardCode,
    );

    if (canUseAddressDirectory.value) {
      if (hasAddressInput && !hasCompleteAddress) {
        actionError.value = "Complete street, ward, district, and province before updating the warehouse address.";
        return;
      }
    }

    actionPending.value = "update";
    actionError.value = "";

    try {
      const payload: {
        name?: string;
        address?: string;
        phoneNational?: string;
      } = {
        name: form.name,
        phoneNational: form.phoneNational,
      };

      if (hasCompleteAddress) {
        payload.address = fullAddress.value;
      } else if (!canUseAddressDirectory.value && normalizedManualAddress && normalizedManualAddress !== warehouse.value?.address) {
        payload.address = normalizedManualAddress;
      }

      data.value = await inventoryApi.updateWarehouse(warehouseId.value, payload);
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

  const removeWarehouse = async () => {
    if (!warehouse.value) {
      return;
    }

    actionPending.value = "remove";
    actionError.value = "";

    try {
      await inventoryApi.removeWarehouse(warehouseId.value);
      await navigateTo("/warehouses");
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to remove warehouse.");
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

  // 7. Return statement
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
    addressDirectoryError,
    actionError,
    actionPending,
    activeTab,
    canRemoveWarehouse,
    canUseAddressDirectory,
    canUpdateWarehouse,
    districts,
    districtsLoading,
    error,
    form,
    fullAddress,
    ghnShopId,
    loadErrorMessage,
    pending,
    provinces,
    provincesLoading,
    refresh,
    removeWarehouse,
    selectTab,
    syncGhnStore,
    toggleWarehouse,
    updateWarehouse,
    warehouse,
    warehouseId,
    warehouseTabs,
    wards,
    wardsLoading,
  };
};

export type WarehouseDetailPageState = Awaited<ReturnType<typeof useWarehouseDetailPage>>;
