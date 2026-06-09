import type { UserAddressResponse } from "~/features/users/types";

export const useUserAddressesTab = (
  props: {
    userId: string;
    addresses: UserAddressResponse[];
  },
  onRefresh: () => void,
) => {
  const usersApi = useUsersAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel } = useAuthPresentation();

  const canCreateAddress = computed(() => authz.can(ADMIN_PERMISSION.userAddressCreateAll));
  const canUpdateAddress = computed(() => authz.can(ADMIN_PERMISSION.userAddressUpdateAll));
  const canRemoveAddress = computed(() => authz.can(ADMIN_PERMISSION.userAddressRemoveAll));

  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");
  const confirmAddressId = ref("");
  const confirmOpen = ref(false);

  const actionErrorOpen = computed(() => actionError.value.length > 0);

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

  const executeConfirm = async () => {
    actionPending.value = "remove";
    actionError.value = "";

    try {
      await usersApi.deleteUserAddress(props.userId, confirmAddressId.value);
      closeConfirm();
      onRefresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to remove the address.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionErrorOpen,
    actionPending,
    canCreateAddress,
    canRemoveAddress,
    canUpdateAddress,
    closeActionError,
    closeConfirm,
    confirmOpen,
    enumLabel,
    executeConfirm,
    openConfirm,
  };
};
