export const useRoleDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const rolesApi = useRolesAdminApi();
  const permissionsApi = usePermissionsAdminApi();
  const authz = useAdminAuthorization();

  // 2. Route & permissions
  type RoleTab = "overview" | "edit" | "permissions";

  const roleId = computed(() => route.params.id as string);
  const canEditRole = computed(() => authz.can(ADMIN_PERMISSION.roleUpdateAll));
  const canViewRolePermissions = computed(() => authz.can(ADMIN_PERMISSION.rolePermissionReadAll));

  // 3. Tab state
  const roleTabs = computed<Array<{ label: string; value: RoleTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(canEditRole.value ? [{ label: "Edit", value: "edit" as const }] : []),
    ...(canViewRolePermissions.value ? [{ label: "Permissions", value: "permissions" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): RoleTab =>
    roleTabs.value.some((tab) => tab.value === value) ? (value as RoleTab) : "overview";

  const activeTab = ref<RoleTab>(normalizeTab(route.query.tab));

  // 4. Data fetching
  const data = ref<{
    role: Awaited<ReturnType<typeof rolesApi.getRoleById>>;
    permissions: Awaited<ReturnType<typeof rolesApi.getRolePermissions>>;
    catalog: Awaited<ReturnType<typeof permissionsApi.getPermissions>> extends { items: infer T }
      ? T
      : never;
  } | null>(null);
  const pending = ref(true);
  const error = ref<unknown>(null);

  const normalizeCatalog = (rawCatalog: unknown) => {
    let currentCatalog = rawCatalog;

    for (let attempt = 0; attempt < 3 && typeof currentCatalog === "string"; attempt += 1) {
      const normalizedText = currentCatalog.trim();

      if (!normalizedText) {
        return [];
      }

      try {
        currentCatalog = JSON.parse(normalizedText);
      } catch {
        break;
      }
    }

    if (Array.isArray(currentCatalog)) {
      return currentCatalog;
    }

    if (!currentCatalog || typeof currentCatalog !== "object") {
      return [];
    }

    const candidate = currentCatalog as {
      items?: unknown;
      Items?: unknown;
      data?: unknown;
      Data?: unknown;
    };

    if (Array.isArray(candidate.items)) {
      return candidate.items;
    }

    if (Array.isArray(candidate.Items)) {
      return candidate.Items;
    }

    if (Array.isArray(candidate.data)) {
      return candidate.data;
    }

    if (Array.isArray(candidate.Data)) {
      return candidate.Data;
    }

    return [];
  };

  const loadRoleDetail = async () => {
    pending.value = true;
    error.value = null;

    // Fetch role first ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â if this fails, the entire page fails.
    let role: Awaited<ReturnType<typeof rolesApi.getRoleById>> | null = null;

    try {
      role = await rolesApi.getRoleById(roleId.value);
    } catch (requestError) {
      error.value = requestError;
      data.value = null;
      pending.value = false;
      return;
    }

    // Fetch permissions and catalog in parallel ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â failures here should not break the role view.
    const [permissionsResult, catalogResult] = await Promise.allSettled([
      rolesApi.getRolePermissions(roleId.value),
      permissionsApi.getPermissions(1, 100),
    ]);

    const permissions = permissionsResult.status === "fulfilled" ? permissionsResult.value : [];
    const rawCatalog = catalogResult.status === "fulfilled" ? catalogResult.value : [];

    data.value = {
      role: role!,
      permissions,
      catalog: normalizeCatalog(rawCatalog),
    };
    pending.value = false;
  };

  await loadRoleDetail();
  const refresh = () => loadRoleDetail();

  // 5. Watchers
  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  watch(roleId, () => {
    void loadRoleDetail();
  });

  // 6. Return statement
  const selectTab = async (tab: RoleTab) => {
    if (!roleTabs.value.some((item) => item.value === tab)) {
      return;
    }

    activeTab.value = tab;
    await navigateTo(
      {
        path: `/roles/${roleId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  return {
    roleId,
    canViewRolePermissions,
    roleTabs,
    activeTab,
    data,
    pending,
    error,
    refresh,
    selectTab,
  };
};

export type RoleDetailPage = Awaited<ReturnType<typeof useRoleDetailPage>>;
