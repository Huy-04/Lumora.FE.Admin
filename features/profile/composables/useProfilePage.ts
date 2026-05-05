export const useProfilePage = async () => {
  type ProfileTab = "profile" | "security";

  const route = useRoute();
  const session = useAuthSession();

  const profileTabs = [
    { label: "Profile", value: "profile" as ProfileTab },
    { label: "Security", value: "security" as ProfileTab },
  ];

  const activeTab = computed<ProfileTab>(() => {
    const tab = route.query.tab;
    if (tab === "security") return "security";
    return "profile";
  });

  const selectTab = (tab: ProfileTab) => {
    navigateTo({ query: { tab } }, { replace: true });
  };

  const authApi = useAuthApi();

  const { data, pending, error, refresh } = await useAsyncData("profile-current", async () => {
    const user = await authApi.getCurrentUser();
    return user;
  });

  const handleUpdated = async () => {
    await Promise.all([refresh(), session.refresh()]);
  };

  return {
    data,
    pending,
    error,
    profileTabs,
    activeTab,
    selectTab,
    handleUpdated,
  };
};

export type ProfilePage = Awaited<ReturnType<typeof useProfilePage>>;
