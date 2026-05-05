export const useUserAddressCreatePage = async () => {
  const route = useRoute();
  const usersApi = useUsersAdminApi();
  const { userAddressTypeOptions } = useAuthOptions();

  const userId = computed(() => route.params.userId as string);
  const actionPending = ref(false);
  const actionError = ref("");

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

  const { data, pending, error } = await useAsyncData(
    () => `user-address-create:${userId.value}`,
    () => usersApi.getUserById(userId.value),
  );

  const saveAddress = async () => {
    actionPending.value = true;
    actionError.value = "";

    try {
      await usersApi.addAddressToUser(userId.value, {
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
      actionError.value = getProblemMessage(requestError, "Unable to add the address.");
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

export type UserAddressCreatePage = Awaited<ReturnType<typeof useUserAddressCreatePage>>;
