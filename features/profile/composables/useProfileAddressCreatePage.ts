import type { GhnDistrictResponse, GhnProvinceResponse, GhnWardResponse } from "~/features/shipments/types/ghn";

export const useProfileAddressCreatePage = async () => {
  // 1. Dependency injection
  const authApi = useAuthApi();
  const ghnApi = useGhnApi();
  const { userAddressTypeOptions } = useAuthOptions();

  // 2. Action state
  const actionPending = ref(false);
  const actionError = ref("");

  // 3. Local state (GHN cascading dropdown)
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

  // 4. Data fetching (load provinces on mount)
  provinces.value = await ghnApi.getProvinces();

  // 5. Computed derivations
  const provinceOptions = computed(() =>
    provinces.value.map((p) => ({ label: p.provinceName, value: String(p.provinceId) })),
  );

  const districtOptions = computed(() =>
    districts.value.map((d) => ({ label: d.districtName, value: String(d.districtId) })),
  );

  const wardOptions = computed(() =>
    wards.value.map((w) => ({ label: w.wardName, value: w.wardCode })),
  );

  // 6. Actions/mutations
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

  const saveAddress = async () => {
    actionPending.value = true;
    actionError.value = "";

    try {
      await authApi.addCurrentUserAddress({
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
      actionError.value = getProblemMessage(requestError, "Unable to add the address.");
    } finally {
      actionPending.value = false;
    }
  };

  // 7. Return statement
  return {
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

export type ProfileAddressCreatePageState = Awaited<ReturnType<typeof useProfileAddressCreatePage>>;
