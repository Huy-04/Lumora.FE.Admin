export const usePermissionDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const permissionsApi = usePermissionsAdminApi();
  const authz = useAdminAuthorization();

  // 2. Route & permissions
  type PermissionTab = "overview" | "edit";

  const permissionId = computed(() => route.params.id as string);
  const canEditPermission = computed(() => authz.can(ADMIN_PERMISSION.permissionUpdateAll));

  // 3. Tab state
  const permissionTabs = computed<Array<{ label: string; value: PermissionTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(canEditPermission.value ? [{ label: "Edit", value: "edit" as const }] : []),
  ]);

  const activeTab = ref<PermissionTab>("overview");

  // 4. Watchers
  watchEffect(() => {
    if (!permissionTabs.value.some((tab) => tab.value === activeTab.value)) {
      activeTab.value = "overview";
    }
  });

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `permission-detail:${permissionId.value}`,
    () => permissionsApi.getPermissionById(permissionId.value),
  );

  // 6. Return statement
  return {
    permissionTabs,
    activeTab,
    data,
    pending,
    error,
    refresh,
  };
};

export type PermissionDetailPage = Awaited<ReturnType<typeof usePermissionDetailPage>>;
