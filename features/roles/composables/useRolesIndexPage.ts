export const useRolesIndexPage = async () => {
  const rolesApi = useRolesAdminApi();
  const authz = useAdminAuthorization();
  const canCreateRole = computed(() => authz.can(ADMIN_PERMISSION.roleCreateAll));
  const canRemoveRole = computed(() => authz.can(ADMIN_PERMISSION.roleRemoveAll));

  const localSearch = ref("");
  const search = ref("");

  const applyFilters = () => {
    search.value = localSearch.value;
  };

  const clearFilters = () => {
    localSearch.value = "";
    search.value = "";
  };

  const confirmRoleId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");
  const actionSuccess = ref("");

  const { data, pending, error, refresh } = await useAsyncData("roles-index", () => rolesApi.getRoles(1, 50));

  const filteredRoles = computed(() => {
    const keyword = search.value.trim().toLowerCase();
    const items = data.value?.items ?? [];

    if (!keyword) {
      return items;
    }

    return items.filter((role) =>
      role.roleName.toLowerCase().includes(keyword)
      || (role.description || "").toLowerCase().includes(keyword),
    );
  });

  const page = ref(1);
  const pageSize = ref("20");
  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const totalRoles = computed(() => filteredRoles.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalRoles.value / Number(pageSize.value))));
  const firstItemNumber = computed(() => totalRoles.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalRoles.value));
  const pagedRoles = computed(() => {
    const start = (page.value - 1) * Number(pageSize.value);
    return filteredRoles.value.slice(start, start + Number(pageSize.value));
  });
  const goToNextPage = () => { if (page.value < totalPages.value) page.value += 1; };
  const goToPreviousPage = () => { if (page.value > 1) page.value -= 1; };

  watch([() => search.value, pageSize], () => { page.value = 1; });
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

  const requestRemove = (roleId: string) => {
    confirmRoleId.value = roleId;
    actionError.value = "";
    actionSuccess.value = "";
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
    actionSuccess.value = "";

    try {
      await rolesApi.deleteRole(confirmRoleId.value);
      actionSuccess.value = "Role removed.";
      confirmRoleId.value = "";
      await refresh();
    } catch (error) {
      actionError.value = getProblemMessage(error, "Unable to remove the role.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
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
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    lastItemNumber,
    localSearch,
    page,
    pageSize,
    pageSizeOptions,
    pagedRoles,
    pending,
    refresh,
    removeRole,
    requestRemove,
    search,
    summaryStats,
    totalPages,
    totalRoles,
  };
};

export type RolesIndexPage = Awaited<ReturnType<typeof useRolesIndexPage>>;
