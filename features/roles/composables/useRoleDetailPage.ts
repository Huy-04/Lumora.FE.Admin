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

  const normalizeTab = (value: RoleTab): RoleTab =>
    roleTabs.value.some((tab) => tab.value === value) ? value : "overview";

  const activeTab = ref<RoleTab>(normalizeTab("overview"));

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
  );

  // 5. Watchers
  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  // 6. Return statement
  return {
    roleId,
    canViewRolePermissions,
    roleTabs,
    activeTab,
    data,
    pending,
    error,
    refresh,
  };
};

export type RoleDetailPage = Awaited<ReturnType<typeof useRoleDetailPage>>;
