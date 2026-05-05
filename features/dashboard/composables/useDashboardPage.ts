export const useDashboardPage = async () => {
  const session = useAuthSession();
  const currentUser = computed(() => session.user.value);

  return {
    currentUser,
  };
};

export type DashboardPage = Awaited<ReturnType<typeof useDashboardPage>>;
