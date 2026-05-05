export const usePermissionsIndexPage = async () => {
  const permissionsApi = usePermissionsAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel } = useAuthPresentation();
  const { permissionModuleOptions, permissionOperationOptions, permissionScopeOptions } = useAuthOptions();
  const canCreatePermission = computed(() => authz.can(ADMIN_PERMISSION.permissionCreateAll));
  const canRemovePermission = computed(() => authz.can(ADMIN_PERMISSION.permissionRemoveAll));

  const localSearch = ref("");
  const search = ref("");
  const localModuleFilter = ref("");
  const moduleFilter = ref("");
  const localOperationFilter = ref("");
  const operationFilter = ref("");
  const localScopeFilter = ref("");
  const scopeFilter = ref("");

  const applyFilters = () => {
    search.value = localSearch.value;
    moduleFilter.value = localModuleFilter.value;
    operationFilter.value = localOperationFilter.value;
    scopeFilter.value = localScopeFilter.value;
  };

  const clearFilters = () => {
    localSearch.value = "";
    localModuleFilter.value = "";
    localOperationFilter.value = "";
    localScopeFilter.value = "";
    applyFilters();
  };

  const confirmPermissionId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");
  const actionSuccess = ref("");

  const moduleOptions = [{ label: "All modules", value: "" }, ...permissionModuleOptions];
  const operationOptions = [{ label: "All operations", value: "" }, ...permissionOperationOptions];
  const scopeOptions = [{ label: "All scopes", value: "" }, ...permissionScopeOptions];

  const { data, pending, error, refresh } = await useAsyncData(
    () => `permissions:${moduleFilter.value || "all"}`,
    () => moduleFilter.value
      ? permissionsApi.getPermissionsByModule(moduleFilter.value, 1, 100)
      : permissionsApi.getPermissions(1, 100),
  );

  const filteredPermissions = computed(() => {
    const items = data.value?.items ?? [];
    const keyword = search.value.trim().toLowerCase();

    return items.filter((permission) => {
      const matchesSearch = !keyword
        || permission.permissionName.toLowerCase().includes(keyword)
        || (permission.description || "").toLowerCase().includes(keyword);
      const matchesOperation = !operationFilter.value || permission.operation === operationFilter.value;
      const matchesScope = !scopeFilter.value || permission.scope === scopeFilter.value;

      return matchesSearch && matchesOperation && matchesScope;
    });
  });

  const page = ref(1);
  const pageSize = ref("20");
  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const totalPermissions = computed(() => filteredPermissions.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalPermissions.value / Number(pageSize.value))));
  const firstItemNumber = computed(() => totalPermissions.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalPermissions.value));
  const pagedPermissions = computed(() => {
    const start = (page.value - 1) * Number(pageSize.value);
    return filteredPermissions.value.slice(start, start + Number(pageSize.value));
  });
  const goToNextPage = () => { if (page.value < totalPages.value) page.value += 1; };
  const goToPreviousPage = () => { if (page.value > 1) page.value -= 1; };

  watch([() => search.value, () => moduleFilter.value, () => operationFilter.value, () => scopeFilter.value, pageSize], () => { page.value = 1; });

  const summaryStats = computed(() => {
    const all = data.value?.items ?? [];

    return [
      {
        label: "Total",
        value: `${all.length}`,
        detail: "Total permission records loaded.",
      },
      {
        label: "Modules",
        value: `${new Set(all.map((p) => p.module)).size}`,
        detail: "Distinct modules covered by loaded permissions.",
      },
      {
        label: "Read ops",
        value: `${all.filter((p) => p.operation === "Read").length}`,
        detail: "Permissions for read-only operations.",
      },
      {
        label: "Write ops",
        value: `${all.filter((p) => p.operation !== "Read").length}`,
        detail: "Permissions for create, update, or delete operations.",
      },
    ];
  });

  const confirmPermission = computed(() =>
    filteredPermissions.value.find((permission) => permission.id === confirmPermissionId.value) ?? null,
  );
  const confirmTitle = computed(() => confirmPermission.value ? `Remove ${confirmPermission.value.permissionName}?` : "");
  const confirmDetail = "This action removes the permission record.";

  const requestRemove = (permissionId: string) => {
    confirmPermissionId.value = permissionId;
    actionError.value = "";
    actionSuccess.value = "";
  };

  const cancelRemove = () => {
    confirmPermissionId.value = "";
  };

  const removePermission = async () => {
    if (!confirmPermissionId.value) {
      return;
    }

    actionPending.value = "remove";
    actionError.value = "";
    actionSuccess.value = "";

    try {
      await permissionsApi.deletePermission(confirmPermissionId.value);
      actionSuccess.value = "Permission removed.";
      confirmPermissionId.value = "";
      await refresh();
    } catch (error) {
      actionError.value = getProblemMessage(error, "Unable to remove the permission.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    applyFilters,
    canCreatePermission,
    canRemovePermission,
    cancelRemove,
    clearFilters,
    confirmDetail,
    confirmPermission,
    confirmTitle,
    data,
    enumLabel,
    error,
    filteredPermissions,
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    lastItemNumber,
    localSearch,
    localModuleFilter,
    moduleFilter,
    moduleOptions,
    localOperationFilter,
    operationFilter,
    operationOptions,
    page,
    pageSize,
    pageSizeOptions,
    pagedPermissions,
    pending,
    refresh,
    removePermission,
    requestRemove,
    localScopeFilter,
    scopeFilter,
    scopeOptions,
    search,
    summaryStats,
    totalPages,
    totalPermissions,
  };
};

export type PermissionsIndexPage = Awaited<ReturnType<typeof usePermissionsIndexPage>>;
