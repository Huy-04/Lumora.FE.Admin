export const useAccessDeniedPage = () => {
  // 1. Dependency injection
  const session = useAuthSession();

  // 2. Submission state
  const pending = ref(false);

  // 3. Actions
  const logout = async () => {
    pending.value = true;

    try {
      await session.logout();
    } finally {
      pending.value = false;
      await navigateTo("/auth/login");
    }
  };

  // 4. Return statement
  return {
    pending,
    logout,
  };
};

export type AuthAccessDeniedPageState = ReturnType<typeof useAccessDeniedPage>;
