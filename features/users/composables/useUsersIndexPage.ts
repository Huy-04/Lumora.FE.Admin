export const useUsersIndexPage = async () => {
  const usersApi = useUsersAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel } = useAuthPresentation();
  const canCreateUser = computed(() => authz.can(ADMIN_PERMISSION.userCreateAll));
  const canRemoveUser = computed(() => authz.can(ADMIN_PERMISSION.userRemoveAll));

  const localKeyword = ref("");
  const localUserStatus = ref("");
  const localEmailStatus = ref("");
  const localPhoneStatus = ref("");

  const keyword = ref("");
  const userStatus = ref("");
  const emailStatus = ref("");
  const phoneStatus = ref("");

  const applyFilters = () => {
    keyword.value = localKeyword.value;
    userStatus.value = localUserStatus.value;
    emailStatus.value = localEmailStatus.value;
    phoneStatus.value = localPhoneStatus.value;
  };

  const clearFilters = () => {
    localKeyword.value = "";
    localUserStatus.value = "";
    localEmailStatus.value = "";
    localPhoneStatus.value = "";
    keyword.value = "";
    userStatus.value = "";
    emailStatus.value = "";
    phoneStatus.value = "";
  };

  const confirmUserId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");

  const page = ref(1);
  const pageSize = ref("20");
  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const applyFiltersWithReset = () => {
    page.value = 1;
    applyFilters();
  };

  const { data, pending, error, refresh } = await useAsyncData(
    () => `users:${keyword.value || "all"}:${userStatus.value || "all"}:${emailStatus.value || "all"}:${phoneStatus.value || "all"}:${page.value}:${pageSize.value}`,
    () => {
      const hasFilter = Boolean(keyword.value || userStatus.value || emailStatus.value || phoneStatus.value);

      if (!hasFilter) {
        return usersApi.getUsers(page.value, Number(pageSize.value));
      }

      return usersApi.searchUsers({
        keyword: keyword.value || undefined,
        userStatus: userStatus.value || undefined,
        emailStatus: emailStatus.value || undefined,
        phoneStatus: phoneStatus.value || undefined,
        page: page.value,
        size: Number(pageSize.value),
      });
    },
  );

  const totalUsers = computed(() => data.value?.totalCount ?? 0);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalUsers.value / Number(pageSize.value))));
  const firstItemNumber = computed(() => totalUsers.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalUsers.value));

  const goToNextPage = () => { if (page.value < totalPages.value) page.value += 1; };
  const goToPreviousPage = () => { if (page.value > 1) page.value -= 1; };

  watch(pageSize, () => { page.value = 1; });

  const confirmUser = computed(() => (data.value?.items ?? []).find((user) => user.id === confirmUserId.value) ?? null);
  const confirmTitle = computed(() => confirmUser.value ? `Remove ${confirmUser.value.fullName}?` : "");
  const confirmDetail = "This action removes the account record.";
  const summaryStats = computed(() => {
    const items = data.value?.items ?? [];

    return [
      {
        label: "Total users",
        value: `${items.length}`,
        detail: "User records in the current result set.",
      },
      {
        label: "Active",
        value: `${items.filter((u) => u.userStatus === "Active").length}`,
        detail: "Accounts currently marked active.",
      },
      {
        label: "Inactive",
        value: `${items.filter((u) => u.userStatus === "Inactive").length}`,
        detail: "Accounts currently marked inactive.",
      },
      {
        label: "Email verified",
        value: `${items.filter((u) => u.emailStatus === "Verified").length}`,
        detail: "Users with a confirmed email address.",
      },
    ];
  });

  const requestRemove = (userId: string) => {
    confirmUserId.value = userId;
    actionError.value = "";
  };

  const cancelRemove = () => {
    confirmUserId.value = "";
  };

  const removeUser = async () => {
    if (!confirmUserId.value) {
      return;
    }

    actionPending.value = "remove";
    actionError.value = "";

    try {
      await usersApi.deleteUser(confirmUserId.value);
      confirmUserId.value = "";
      await refresh();
    } catch (error) {
      actionError.value = getProblemMessage(error, "Unable to remove the user.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    applyFilters: applyFiltersWithReset,
    canCreateUser,
    canRemoveUser,
    cancelRemove,
    clearFilters,
    confirmDetail,
    confirmTitle,
    confirmUser,
    data,
    emailStatus,
    enumLabel,
    error,
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    keyword,
    lastItemNumber,
    localEmailStatus,
    localKeyword,
    localPhoneStatus,
    localUserStatus,
    page,
    pageSize,
    pageSizeOptions,
    pending,
    phoneStatus,
    refresh,
    removeUser,
    requestRemove,
    summaryStats,
    totalPages,
    totalUsers,
    userStatus,
  };
};

export type UsersIndexPage = Awaited<ReturnType<typeof useUsersIndexPage>>;
