import type { UserResponse } from "~/features/users/types";

export const useUserPasswordTab = (
  user: MaybeRefOrGetter<UserResponse>,
) => {
  const usersApi = useUsersAdminApi();
  const currentUser = computed(() => toValue(user));

  const pending = ref(false);
  const errorMessage = ref("");
  const successMessage = ref("");
  const adminPassword = ref("");
  const { rules: passwordRules } = usePasswordRules(adminPassword);

  const submit = async () => {
    if (!adminPassword.value.trim()) {
      errorMessage.value = "Please enter a new password.";
      return;
    }

    pending.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      await usersApi.adminSetPassword(currentUser.value.id, { password: adminPassword.value });
      adminPassword.value = "";
      successMessage.value = "Password has been set successfully.";
    } catch (requestError) {
      errorMessage.value = getProblemMessage(requestError, "Unable to set the password.");
    } finally {
      pending.value = false;
    }
  };

  return {
    adminPassword,
    errorMessage,
    passwordRules,
    pending,
    submit,
    successMessage,
  };
};
