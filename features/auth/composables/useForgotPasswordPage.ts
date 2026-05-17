export const useForgotPasswordPage = async () => {
  // 1. Dependency injection
  const authApi = useAuthApi();
  const router = useRouter();

  // 2. Form state
  const form = reactive({
    email: "",
  });

  // 3. Submission state
  const pending = ref(false);
  const successMessage = ref("");
  const errorMessage = ref("");
  const attempted = ref(false);

  // 4. Computed / derived state
  const emailError = computed(() => {
    if (!attempted.value) return "";
    if (!form.email.trim()) return "Enter your account email.";
    return "";
  });

  // 5. Actions
  const submit = async () => {
    attempted.value = true;
    if (emailError.value) {
      errorMessage.value = "Enter your email and try again.";
      return;
    }

    pending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      await authApi.requestPasswordReset({ email: form.email.trim() });
      successMessage.value = "If the account exists, a reset code has been sent.";
      await router.push({
        path: "/auth/reset-password",
        query: { email: form.email.trim() },
      });
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to send a reset code.");
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    form,
    pending,
    successMessage,
    errorMessage,
    emailError,
    submit,
  };
};

export type AuthForgotPasswordPageState = Awaited<ReturnType<typeof useForgotPasswordPage>>;
