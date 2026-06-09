const PHONE_NATIONAL_PATTERN = /^0\d{9}$/;

export const useWarehouseCreatePage = async () => {
  // 1. Dependency injection
  const inventoryApi = useInventoryAdminApi();
  const ghnApi = useGhnApi();
  const { warehouseCodeOptions } = useInventoryOptions();

  // 2. Form state
  const form = reactive({
    code: "1",
    name: "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    street: "",
    manualAddress: "",
    phoneNational: "",
  });

  const pending = ref(false);
  const errorMessage = ref("");
  const addressDirectoryError = ref("");

  // 3. GHN address data
  const provinces = ref<Array<{ label: string; value: string }>>([]);
  const districts = ref<Array<{ label: string; value: string }>>([]);
  const wards = ref<Array<{ label: string; value: string }>>([]);
  const provincesLoading = ref(false);
  const districtsLoading = ref(false);
  const wardsLoading = ref(false);
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

  // 4. Computed derivations
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

  // 5. Actions/mutations
  const submit = async () => {
    if (canUseAddressDirectory.value) {
      const hasCompleteAddress = Boolean(
        form.street.trim()
        && form.provinceId
        && form.districtId
        && form.wardCode,
      );

      if (!hasCompleteAddress) {
        errorMessage.value = "Complete street, ward, district, and province before creating a warehouse.";
        return;
      }
    } else if (!form.manualAddress.trim()) {
      errorMessage.value = "Enter the warehouse address manually before creating the warehouse.";
      return;
    }

    // Validate phoneNational is in national format (e.g. 0xxxxxxxxx)
    if (!PHONE_NATIONAL_PATTERN.test(form.phoneNational)) {
      errorMessage.value = "Phone must be in national format (e.g. 0901234567).";
      return;
    }

    pending.value = true;
    errorMessage.value = "";
    try {
      const created = await inventoryApi.createWarehouse({
        code: Number(form.code),
        name: form.name,
        address: fullAddress.value,
        phoneNational: form.phoneNational,
      });
      await navigateTo(`/warehouses/${created.id}`);
    } catch (requestError) {
      const status = getProblemStatus(requestError);
      if (status === 409) {
        errorMessage.value = getProblemMessage(requestError, "A warehouse with this code already exists.");
      } else {
        errorMessage.value = getProblemMessage(requestError, "Unable to create warehouse.");
      }
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    addressDirectoryError,
    canUseAddressDirectory,
    districts,
    districtsLoading,
    errorMessage,
    form,
    fullAddress,
    pending,
    provinces,
    provincesLoading,
    submit,
    warehouseCodeOptions,
    wards,
    wardsLoading,
  };
};

export type WarehouseCreatePageState = Awaited<ReturnType<typeof useWarehouseCreatePage>>;
