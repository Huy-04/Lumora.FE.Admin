export const useRolesIndexPage = async () => {
  // 1. Dependency injection
  const rolesApi = useRolesAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const canCreateRole = computed(() => authz.can(ADMIN_PERMISSION.roleCreateAll));
  const canRemoveRole = computed(() => authz.can(ADMIN_PERMISSION.roleRemoveAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      { keyword: "" },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData("roles-index", () => rolesApi.getRoles(1, 50));

  // 6. Computed derivations
  const filteredRoles = computed(() => {
    const keyword = appliedFilters.keyword.value.trim().toLowerCase();
    const items = data.value?.items ?? [];

    if (!keyword) {
      return items;
    }

    return items.filter((role) =>
      role.roleName.toLowerCase().includes(keyword)
      || (role.description || "").toLowerCase().includes(keyword),
    );
  });

  const pagedRoles = computed(() => {
    const start = (pagination.page.value - 1) * Number(pagination.pageSize.value);
    return filteredRoles.value.slice(start, start + Number(pagination.pageSize.value));
  });

  // Wire totalItems to filteredRoles length (client-side pagination)
  watch(() => filteredRoles.value.length, (count) => {
    totalItems.value = count;
  }, { immediate: true });

  const summaryStats = computed(() => {
    const all = data.value?.items ?? [];
    const shown = filteredRoles.value;

    return [
      {
        label: "Total roles",
        value: `${all.length}`,
        detail: "Total role records in the system.",
      },
      {
        label: "With description",
        value: `${all.filter((r) => Boolean(r.description)).length}`,
        detail: "Roles that have a usage description.",
      },
      {
        label: "No description",
        value: `${all.filter((r) => !r.description).length}`,
        detail: "Roles missing an operator description.",
      },
      {
        label: "Showing",
        value: `${shown.length}`,
        detail: "Results matching the current search.",
      },
    ];
  });

  const confirmRole = computed(() => filteredRoles.value.find((role) => role.id === confirmRoleId.value) ?? null);
  const confirmTitle = computed(() => confirmRole.value ? `Remove ${confirmRole.value.roleName}?` : "");
  const confirmDetail = "This action removes the role record.";
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The role list is unavailable."));

  // 7. Actions/mutations
  const confirmRoleId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");

  const requestRemove = (roleId: string) => {
    confirmRoleId.value = roleId;
    actionError.value = "";
  };

  const cancelRemove = () => {
    confirmRoleId.value = "";
  };

  const removeRole = async () => {
    if (!confirmRoleId.value) {
      return;
    }

    actionPending.value = "remove";
    actionError.value = "";

    try {
      await rolesApi.deleteRole(confirmRoleId.value);
      confirmRoleId.value = "";
      await refresh();
    } catch (error) {
      actionError.value = getProblemMessage(error, "Unable to remove the role.");
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
    canCreateRole,
    canRemoveRole,
    cancelRemove,
    clearFilters,
    confirmDetail,
    confirmRole,
    confirmTitle,
    data,
    error,
    filteredRoles,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    pagedRoles,
    pending,
    refresh,
    removeRole,
    requestRemove,
    summaryStats,
    ...pagination,
  };
};

export type RoleIndexPageState = Awaited<ReturnType<typeof useRolesIndexPage>>;
