export const usePermissionsIndexPage = async () => {
  // 1. Dependency injection
  const permissionsApi = usePermissionsAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel } = useAuthPresentation();
  const { permissionModuleOptions, permissionOperationOptions, permissionScopeOptions } = useAuthOptions();
  const permissionModules = permissionModuleOptions.map((option) => option.value);

  // 2. Permissions
  const canCreatePermission = computed(() => authz.can(ADMIN_PERMISSION.permissionCreateAll));
  const canRemovePermission = computed(() => authz.can(ADMIN_PERMISSION.permissionRemoveAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } = useFilters(
    { search: "", module: "", operation: "", scope: "" },
    { onApply: () => { pagination.page.value = 1; } },
  );

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `permissions:${appliedFilters.module.value || "all"}`,
    async () => {
      if (appliedFilters.module.value) {
        return permissionsApi.getPermissionsByModule(appliedFilters.module.value, 1, 100);
      }

      const moduleResponses = await Promise.allSettled(
        permissionModules.map((module) => permissionsApi.getPermissionsByModule(module, 1, 100)),
      );
      const items = moduleResponses.flatMap((response) =>
        response.status === "fulfilled" ? response.value.items : [],
      );

      return {
        items,
        totalCount: items.length,
        page: 1,
        size: items.length,
        totalPages: 1,
      };
    },
  );

  // 6. Computed derivations
  const moduleOptions = [{ label: "All modules", value: "" }, ...permissionModuleOptions];
  const operationOptions = [{ label: "All operations", value: "" }, ...permissionOperationOptions];
  const scopeOptions = [{ label: "All scopes", value: "" }, ...permissionScopeOptions];

  const filteredPermissions = computed(() => {
    const items = data.value?.items ?? [];
    const keyword = appliedFilters.search.value.trim().toLowerCase();

    return items.filter((permission) => {
      const matchesSearch = !keyword
        || permission.permissionName.toLowerCase().includes(keyword)
        || (permission.description || "").toLowerCase().includes(keyword);
      const matchesOperation = !appliedFilters.operation.value || permission.operation === appliedFilters.operation.value;
      const matchesScope = !appliedFilters.scope.value || permission.scope === appliedFilters.scope.value;

      return matchesSearch && matchesOperation && matchesScope;
    });
  });

  const pagedPermissions = computed(() => {
    const start = (pagination.page.value - 1) * Number(pagination.pageSize.value);
    return filteredPermissions.value.slice(start, start + Number(pagination.pageSize.value));
  });

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

  // Wire totalItems to filteredPermissions count (client-side pagination)
  watch(() => filteredPermissions.value.length, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const confirmPermissionId = ref("");
  const actionPending = ref<"" | "remove">("");
  const actionError = ref("");

  const confirmPermission = computed(() =>
    filteredPermissions.value.find((permission) => permission.id === confirmPermissionId.value) ?? null,
  );
  const confirmTitle = computed(() => confirmPermission.value ? `Remove ${confirmPermission.value.permissionName}?` : "");
  const confirmDetail = "This action removes the permission record.";

  // 7. Actions/mutations
  const requestRemove = (permissionId: string) => {
    confirmPermissionId.value = permissionId;
    actionError.value = "";
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

    try {
      await permissionsApi.deletePermission(confirmPermissionId.value);
      confirmPermissionId.value = "";
      await refresh();
    } catch (error) {
      actionError.value = getProblemMessage(error, "Unable to remove the permission.");
    } finally {
      actionPending.value = "";
    }
  };

  // 8. Watchers
  // (pagination reset on filter change is handled by useFilters onApply callback)

  // 9. Return statement
  return {
    actionError,
    actionPending,
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
    hasActiveFilters,
    localFilters,
    moduleOptions,
    operationOptions,
    pagedPermissions,
    pending,
    refresh,
    removePermission,
    requestRemove,
    scopeOptions,
    summaryStats,
    ...pagination,
  };
};

export type PermissionIndexPageState = Awaited<ReturnType<typeof usePermissionsIndexPage>>;
