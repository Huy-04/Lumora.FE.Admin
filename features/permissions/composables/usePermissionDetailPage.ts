export const usePermissionDetailPage = async () => {
  const route = useRoute();
  const permissionsApi = usePermissionsAdminApi();
  const authz = useAdminAuthorization();

  type PermissionTab = "overview" | "edit";

  const permissionId = computed(() => route.params.id as string);
  const canEditPermission = computed(() => authz.can(ADMIN_PERMISSION.permissionUpdateAll));

  const permissionTabs = computed<Array<{ label: string; value: PermissionTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(canEditPermission.value ? [{ label: "Edit", value: "edit" as const }] : []),
  ]);

  const activeTab = ref<PermissionTab>("overview");

  watchEffect(() => {
    if (!permissionTabs.value.some((tab) => tab.value === activeTab.value)) {
      activeTab.value = "overview";
    }
  });

  const { data, pending, error, refresh } = await useAsyncData(
    () => `permission-detail:${permissionId.value}`,
    () => permissionsApi.getPermissionById(permissionId.value),
  );

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
