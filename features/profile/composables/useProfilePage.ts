export const useProfilePage = async () => {
  type ProfileTab = "profile" | "addresses" | "security";

  // 1. Dependency injection
  const route = useRoute();
  const session = useAuthSession();

  // 2. Tabs
  const profileTabs = [
    { label: "Profile", value: "profile" as ProfileTab },
    { label: "Addresses", value: "addresses" as ProfileTab },
    { label: "Security", value: "security" as ProfileTab },
  ];

  const activeTab = computed<ProfileTab>(() => {
    const tab = route.query.tab;
    if (tab === "addresses") return "addresses";
    if (tab === "security") return "security";
    return "profile";
  });

  const selectTab = (tab: ProfileTab) => {
    navigateTo({ query: { tab } }, { replace: true });
  };

  // 3. Data fetching
  const authApi = useAuthApi();

  const { data: payload, pending, error, refresh } = await useAsyncData("profile-current", async () => {
    const [user, addresses] = await Promise.all([
      authApi.getCurrentUser(),
      authApi.getCurrentUserAddresses(),
    ]);

    return {
      user,
      addresses,
    };
  });

  // 4. Computed derivations
  const data = computed(() => payload.value?.user ?? null);
  const addresses = computed(() => payload.value?.addresses ?? []);

  // 5. Actions/mutations
  const handleUpdated = async () => {
    await Promise.all([refresh(), session.refresh()]);
  };

  // 6. Return statement
  return {
    data,
    pending,
    error,
    addresses,
    profileTabs,
    activeTab,
    selectTab,
    handleUpdated,
  };
};

export type ProfilePageState = Awaited<ReturnType<typeof useProfilePage>>;
