import type { GhnDistrictResponse, GhnProvinceResponse, GhnWardResponse } from "~/features/shipments/types/ghn";

export const useUserAddressEditPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const usersApi = useUsersAdminApi();
  const ghnApi = useGhnApi();
  const { userAddressTypeOptions } = useAuthOptions();

  // 2. Reactive state
  const userId = computed(() => route.params.userId as string);
  const addressId = computed(() => route.params.addressId as string);
  const actionPending = ref(false);
  const actionError = ref("");

  // 3. GHN cascading dropdown state
  const provinces = ref<GhnProvinceResponse[]>([]);
  const districts = ref<GhnDistrictResponse[]>([]);
  const wards = ref<GhnWardResponse[]>([]);
  const selectedProvinceId = ref<string | null>(null);
  const selectedDistrictId = ref<string | null>(null);
  const provincesLoading = ref(false);
  const districtsLoading = ref(false);
  const wardsLoading = ref(false);

  // 4. Form state
  const form = reactive({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    addressType: "Home",
    isDefault: false,
    ghnDistrictId: 0,
    ghnWardCode: "",
  });

  // 5. Load provinces on mount
  provincesLoading.value = true;
  try {
    provinces.value = await ghnApi.getProvinces();
  } finally {
    provincesLoading.value = false;
  }

  // 6. Data fetching
  const { data, pending, error } = await useAsyncData(
    () => `user-address-edit:${userId.value}:${addressId.value}`,
    async () => {
      const [user, addresses] = await Promise.all([
        usersApi.getUserById(userId.value),
        usersApi.getUserAddresses(userId.value),
      ]);

      const address = addresses.find((entry) => entry.id === addressId.value);

      if (!address) {
        throw createError({ statusCode: 404, statusMessage: "Address not found" });
      }

      return { user, address };
    },
  );

  // 7. Computed derivations
  const provinceOptions = computed(() =>
    provinces.value.map((p) => ({ label: p.provinceName, value: String(p.provinceId) })),
  );
  const districtOptions = computed(() =>
    districts.value.map((d) => ({ label: d.districtName, value: String(d.districtId) })),
  );
  const wardOptions = computed(() =>
    wards.value.map((w) => ({ label: w.wardName, value: w.wardCode })),
  );

  // 8. Actions/mutations
  const onProvinceChange = async (value: string | number) => {
    const provinceId = Number(value);
    const province = provinces.value.find((p) => p.provinceId === provinceId);
    form.province = province?.provinceName ?? "";
    form.district = "";
    form.ward = "";
    form.ghnDistrictId = 0;
    form.ghnWardCode = "";
    selectedProvinceId.value = provinceId > 0 ? String(provinceId) : null;
    selectedDistrictId.value = null;
    districts.value = [];
    wards.value = [];
    if (provinceId > 0) {
      districtsLoading.value = true;
      try {
        districts.value = await ghnApi.getDistricts(provinceId);
      } finally {
        districtsLoading.value = false;
      }
    }
  };

  const onDistrictChange = async (value: string | number) => {
    const districtId = Number(value);
    const district = districts.value.find((d) => d.districtId === districtId);
    form.district = district?.districtName ?? "";
    form.ward = "";
    form.ghnDistrictId = districtId > 0 ? districtId : 0;
    form.ghnWardCode = "";
    selectedDistrictId.value = districtId > 0 ? String(districtId) : null;
    wards.value = [];
    if (districtId > 0) {
      wardsLoading.value = true;
      try {
        wards.value = await ghnApi.getWards(districtId);
      } finally {
        wardsLoading.value = false;
      }
    }
  };

  const onWardChange = (value: string | number) => {
    const wardCode = String(value);
    const ward = wards.value.find((w) => w.wardCode === wardCode);
    form.ward = ward?.wardName ?? "";
    form.ghnWardCode = wardCode;
  };

  // 9. Watchers
  // Populate form + pre-load districts/wards for existing address
  watch(
    () => data.value?.address,
    async (address) => {
      if (!address) return;

      form.fullName = address.fullName;
      form.phone = address.phone;
      form.province = address.province;
      form.district = address.district;
      form.ward = address.ward;
      form.street = address.street;
      form.addressType = address.addressType;
      form.isDefault = address.isDefault;
      form.ghnDistrictId = address.ghnDistrictId;
      form.ghnWardCode = address.ghnWardCode;

      if (address.ghnDistrictId > 0) {
        districtsLoading.value = true;
        try {
          for (const province of provinces.value) {
            const districtList = await ghnApi.getDistricts(province.provinceId);
            const found = districtList.find((d) => d.districtId === address.ghnDistrictId);
            if (found) {
              selectedProvinceId.value = String(province.provinceId);
              districts.value = districtList;
              selectedDistrictId.value = String(address.ghnDistrictId);
              wardsLoading.value = true;
              try {
                wards.value = await ghnApi.getWards(address.ghnDistrictId);
              } finally {
                wardsLoading.value = false;
              }
              break;
            }
          }
        } finally {
          districtsLoading.value = false;
        }
      }
    },
    { immediate: true },
  );

  const saveAddress = async () => {
    actionPending.value = true;
    actionError.value = "";

    try {
      await usersApi.updateUserAddress(userId.value, addressId.value, {
        fullName: form.fullName,
        phone: form.phone,
        province: form.province,
        district: form.district,
        ward: form.ward,
        street: form.street,
        addressType: form.addressType,
        isDefault: form.isDefault,
        ghnDistrictId: form.ghnDistrictId,
        ghnWardCode: form.ghnWardCode,
      });

      await navigateTo({
        path: `/users/${userId.value}`,
        query: { tab: "addresses" },
      });
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the address.");
    } finally {
      actionPending.value = false;
    }
  };

  // 10. Return statement
  return {
    error,
    pending,
    data,
    userId,
    form,
    userAddressTypeOptions,
    provinceOptions,
    districtOptions,
    wardOptions,
    selectedProvinceId,
    selectedDistrictId,
    provincesLoading,
    districtsLoading,
    wardsLoading,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    saveAddress,
    actionPending,
    actionError,
  };
};

export type UserAddressEditPage = Awaited<ReturnType<typeof useUserAddressEditPage>>;
