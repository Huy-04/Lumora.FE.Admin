import type { GhnDistrictResponse, GhnProvinceResponse, GhnWardResponse } from "~/features/shipments/types/ghn";

export const useProfileAddressEditPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const authApi = useProfileApi();
  const ghnApi = useGhnApi();
  const { userAddressTypeOptions } = useAuthOptions();

  // 2. Route params
  const addressId = computed(() => route.params.addressId as string);

  // 3. Action state
  const actionPending = ref(false);
  const actionError = ref("");

  // 4. Local state (GHN cascading dropdown)
  const provinces = ref<GhnProvinceResponse[]>([]);
  const districts = ref<GhnDistrictResponse[]>([]);
  const wards = ref<GhnWardResponse[]>([]);

  const selectedProvinceId = ref<string | null>(null);
  const selectedDistrictId = ref<string | null>(null);

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

  // 5. Data fetching (load provinces on mount)
  provinces.value = await ghnApi.getProvinces();

  const { data, pending, error } = await useAsyncData(
    () => `profile-address-edit:${addressId.value}`,
    async () => {
      const [user, addresses] = await Promise.all([
        authApi.getCurrentUser(),
        authApi.getCurrentUserAddresses(),
      ]);

      const address = addresses.find((entry) => entry.id === addressId.value);

      if (!address) {
        throw createError({ statusCode: 404, statusMessage: "Address not found" });
      }

      return { user, address };
    },
  );

  // 6. Computed derivations
  const provinceOptions = computed(() =>
    provinces.value.map((p) => ({ label: p.provinceName, value: String(p.provinceId) })),
  );

  const districtOptions = computed(() =>
    districts.value.map((d) => ({ label: d.districtName, value: String(d.districtId) })),
  );

  const wardOptions = computed(() =>
    wards.value.map((w) => ({ label: w.wardName, value: w.wardCode })),
  );

  // 7. Actions/mutations
  const onProvinceChange = async (value: string | number) => {
    const provinceId = Number(value);
    const province = provinces.value.find((p) => p.provinceId === provinceId);
    form.province = province?.provinceName ?? "";
    form.district = "";
    form.ward = "";
    form.ghnDistrictId = 0;
    form.ghnWardCode = "";
    selectedProvinceId.value = String(provinceId);
    selectedDistrictId.value = null;
    districts.value = [];
    wards.value = [];

    if (provinceId > 0) {
      districts.value = await ghnApi.getDistricts(provinceId);
    }
  };

  const onDistrictChange = async (value: string | number) => {
    const districtId = Number(value);
    const district = districts.value.find((d) => d.districtId === districtId);
    form.district = district?.districtName ?? "";
    form.ward = "";
    form.ghnDistrictId = districtId;
    form.ghnWardCode = "";
    selectedDistrictId.value = String(districtId);
    wards.value = [];

    if (districtId > 0) {
      wards.value = await ghnApi.getWards(districtId);
    }
  };

  const onWardChange = (value: string | number) => {
    const wardCode = String(value);
    const ward = wards.value.find((w) => w.wardCode === wardCode);
    form.ward = ward?.wardName ?? "";
    form.ghnWardCode = wardCode;
  };

  // 8. Watchers
  // Populate form when address data loads
  // Also pre-load districts/wards for the existing address
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

      // Pre-load districts and wards so dropdowns show current values
      if (address.ghnDistrictId > 0) {
        // Find the province that contains this district
        for (const province of provinces.value) {
          const districtList = await ghnApi.getDistricts(province.provinceId);
          const found = districtList.find((d) => d.districtId === address.ghnDistrictId);
          if (found) {
            selectedProvinceId.value = String(province.provinceId);
            districts.value = districtList;
            selectedDistrictId.value = String(address.ghnDistrictId);
            wards.value = await ghnApi.getWards(address.ghnDistrictId);
            break;
          }
        }
      }
    },
    { immediate: true },
  );

  const saveAddress = async () => {
    actionPending.value = true;
    actionError.value = "";

    try {
      await authApi.updateCurrentUserAddress(addressId.value, {
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
        path: "/profile",
        query: { tab: "addresses" },
      });
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to update the address.");
    } finally {
      actionPending.value = false;
    }
  };

  // 9. Return statement
  return {
    error,
    pending,
    data,
    form,
    userAddressTypeOptions,
    provinceOptions,
    districtOptions,
    wardOptions,
    selectedProvinceId,
    selectedDistrictId,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    saveAddress,
    actionPending,
    actionError,
  };
};

export type ProfileAddressEditPageState = Awaited<ReturnType<typeof useProfileAddressEditPage>>;
