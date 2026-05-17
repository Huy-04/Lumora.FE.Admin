export const useUsersIndexPage = async () => {
  // 1. Dependency injection
  const usersApi = useUsersAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel } = useAuthPresentation();

  // 2. Permissions
  const canCreateUser = computed(() => authz.can(ADMIN_PERMISSION.userCreateAll));
  const canRemoveUser = computed(() => authz.can(ADMIN_PERMISSION.userRemoveAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "", userStatus: "", emailStatus: "", phoneStatus: "" },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `users:${appliedFilters.keyword.value || "all"}:${appliedFilters.userStatus.value || "all"}:${appliedFilters.emailStatus.value || "all"}:${appliedFilters.phoneStatus.value || "all"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => {
      const hasFilter = Boolean(
        appliedFilters.keyword.value || appliedFilters.userStatus.value || appliedFilters.emailStatus.value || appliedFilters.phoneStatus.value,
      );

      if (!hasFilter) {
        return usersApi.getUsers(pagination.page.value, Number(pagination.pageSize.value));
      }

      return usersApi.searchUsers({
        keyword: appliedFilters.keyword.value || undefined,
        userStatus: appliedFilters.userStatus.value || undefined,
        emailStatus: appliedFilters.emailStatus.value || undefined,
        phoneStatus: appliedFilters.phoneStatus.value || undefined,
        page: pagination.page.value,
        size: Number(pagination.pageSize.value),
      });
    },
  );

  // 6. Computed derivations
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const totalUsers = computed(() => data.value?.totalCount ?? 0);
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

  // 7. Actions/mutations
  const confirmUserId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");

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

  // 8. Watchers
  // (pagination reset on filter apply and pageSize change handled by usePagination and useFilters)

  // 9. Return statement
  return {
    actionError,
    actionPending,
    applyFilters,
    canCreateUser,
    canRemoveUser,
    cancelRemove,
    clearFilters,
    confirmDetail,
    confirmTitle,
    confirmUser,
    data,
    enumLabel,
    error,
    hasActiveFilters,
    localFilters,
    pending,
    refresh,
    removeUser,
    requestRemove,
    summaryStats,
    totalUsers,
    ...pagination,
  };
};

export type UserIndexPageState = Awaited<ReturnType<typeof useUsersIndexPage>>;
