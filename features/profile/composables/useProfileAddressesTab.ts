export const useProfileAddressesTab = (
  onUpdated: () => void,
) => {
  const authApi = useProfileApi();

  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");
  const confirmAddressId = ref("");
  const confirmOpen = ref(false);

  const closeActionError = () => {
    actionError.value = "";
  };

  const openConfirm = (addressId: string) => {
    confirmAddressId.value = addressId;
    confirmOpen.value = true;
  };

  const closeConfirm = () => {
    confirmAddressId.value = "";
    confirmOpen.value = false;
  };

  const removeAddress = async () => {
    actionPending.value = "remove";
    actionError.value = "";

    try {
      await authApi.deleteCurrentUserAddress(confirmAddressId.value);
      closeConfirm();
      onUpdated();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to remove the address.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    closeActionError,
    closeConfirm,
    confirmAddressId,
    confirmOpen,
    openConfirm,
    removeAddress,
  };
};
