export const useProfileSecurityFlow = (
  onUpdated: () => void,
) => {
  const authApi = useAuthApi();
  const authSession = useAuthSession();

  const passwordForm = reactive({
    oldPassword: "",
    newPassword: "",
  });

  const newPasswordRef = computed(() => passwordForm.newPassword);
  const { rules: passwordRules } = usePasswordRules(newPasswordRef);

  const passwordPending = ref(false);
  const passwordSuccess = ref("");
  const passwordError = ref("");

  const submitPassword = async () => {
    passwordPending.value = true;
    passwordSuccess.value = "";
    passwordError.value = "";

    try {
      await authApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      passwordForm.oldPassword = "";
      passwordForm.newPassword = "";
      passwordSuccess.value = "Password changed. All sessions revoked. Redirecting to login...";

      // Clear session state to stop active refresh timers.
      authSession.clear();
      onUpdated();

      setTimeout(() => {
        navigateTo({
          path: "/auth/login",
          query: { reason: "security-updated" },
        });
      }, 3000);
    } catch (requestError) {
      passwordError.value = getProblemMessage(requestError, "Unable to change password.");
    } finally {
      passwordPending.value = false;
    }
  };

  return {
    passwordError,
    passwordForm,
    passwordPending,
    passwordRules,
    passwordSuccess,
    submitPassword,
  };
};
