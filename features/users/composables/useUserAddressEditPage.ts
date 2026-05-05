export const useUserAddressEditPage = async () => {
  const route = useRoute();
  const usersApi = useUsersAdminApi();
  const { userAddressTypeOptions } = useAuthOptions();

  const userId = computed(() => route.params.userId as string);
  const addressId = computed(() => route.params.addressId as string);
  const actionPending = ref(false);
  const actionError = ref("");

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

      return {
        user,
        address,
      };
    },
  );

  const form = reactive({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    addressType: "Home",
    isDefault: false,
  });

  watch(
    () => data.value?.address,
    (address) => {
      if (!address) {
        return;
      }

      form.fullName = address.fullName;
      form.phone = address.phone;
      form.province = address.province;
      form.district = address.district;
      form.ward = address.ward;
      form.street = address.street;
      form.addressType = address.addressType;
      form.isDefault = address.isDefault;
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

  return {
    error,
    pending,
    data,
    userId,
    form,
    userAddressTypeOptions,
    saveAddress,
    actionPending,
    actionError,
  };
};

export type UserAddressEditPage = Awaited<ReturnType<typeof useUserAddressEditPage>>;
