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
  const canViewRolePermissions = computed(() => authz.can(ADMIN_PERMISSION.permissionReadAll));

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
  const { data, pending, error, refresh } = await useAsyncData(
    () => `role-detail:${roleId.value}`,
    async () => {
      const role = await rolesApi.getRoleById(roleId.value);
      const permissions = canViewRolePermissions.value
        ? await rolesApi.getRolePermissions(roleId.value)
        : [];
      const catalog = canViewRolePermissions.value
        ? await permissionsApi.getPermissions(1, 100)
        : { items: [] };

      return {
        role,
        permissions,
        catalog: catalog.items,
      };
    },
    { watch: [canViewRolePermissions] }
  );

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
