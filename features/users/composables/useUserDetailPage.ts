export const useUserDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const usersApi = useUsersAdminApi();
  const rolesApi = useRolesAdminApi();
  const sessionsApi = useSessionsAdminApi();
  const authz = useAdminAuthorization();
  const { enumLabel } = useAuthPresentation();

  // 2. Permissions
  type UserTab = "overview" | "edit" | "roles" | "password" | "addresses" | "sessions";

  const userId = computed(() => route.params.id as string);
  const canEditUserProfile = computed(() => authz.can(ADMIN_PERMISSION.userUpdateAll));
  const canViewUserRoles = computed(() => authz.can(ADMIN_PERMISSION.roleReadAll));
  const canSetUserPassword = computed(() => authz.can(ADMIN_PERMISSION.userUpdateAll));
  const canViewUserAddresses = computed(() => authz.can(ADMIN_PERMISSION.userAddressReadAll));
  const canViewUserSessions = computed(() => authz.can(ADMIN_PERMISSION.refreshTokenReadAll));

  // 3. Tab management
  const resolveTab = (value: unknown): UserTab => {
    if (value === "profile" || value === "edit") {
      return "edit";
    }

    if (value === "roles" || value === "password" || value === "addresses" || value === "sessions") {
      return value;
    }

    return "overview";
  };

  const userTabs = computed<Array<{ label: string; value: UserTab }>>(() => [
    { label: "Overview", value: "overview" },
    ...(canEditUserProfile.value ? [{ label: "Edit", value: "edit" as const }] : []),
    ...(canViewUserRoles.value ? [{ label: "Roles", value: "roles" as const }] : []),
    ...(canSetUserPassword.value ? [{ label: "Password", value: "password" as const }] : []),
    ...(canViewUserAddresses.value ? [{ label: "Addresses", value: "addresses" as const }] : []),
    ...(canViewUserSessions.value ? [{ label: "Sessions", value: "sessions" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): UserTab => {
    const resolved = resolveTab(value);
    return userTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const activeTab = ref<UserTab>(normalizeTab(route.query.tab));

  // 4. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `user-detail:${userId.value}`,
    async () => {
      const user = await usersApi.getUserById(userId.value);
      const [roles, addresses, sessions, rolesCatalog] = await Promise.all([
        canViewUserRoles.value ? usersApi.getUserRoles(userId.value) : Promise.resolve([]),
        canViewUserAddresses.value ? usersApi.getUserAddresses(userId.value) : Promise.resolve([]),
        canViewUserSessions.value ? sessionsApi.getSessionsByUserId(userId.value) : Promise.resolve([]),
        canViewUserRoles.value ? rolesApi.getRoles(1, 50).then((response) => response.items) : Promise.resolve([]),
      ]);

      return {
        user,
        roles,
        addresses,
        sessions,
        rolesCatalog,
      };
    },
  );

  // 5. Actions/mutations
  const selectTab = async (tab: UserTab) => {
    if (!userTabs.value.some((item) => item.value === tab)) {
      return;
    }

    activeTab.value = tab;
    await navigateTo(
      {
        path: `/users/${userId.value}`,
        query: { tab },
      },
      { replace: true },
    );
  };

  // 6. Watchers
  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  // 7. Return statement
  return {
    userId,
    userTabs,
    activeTab,
    data,
    pending,
    error,
    refresh,
    selectTab,
    enumLabel,
  };
};

export type UserDetailPage = Awaited<ReturnType<typeof useUserDetailPage>>;
