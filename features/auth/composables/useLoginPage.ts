export const useLoginPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const session = useAuthSession();
  const resolveRedirectTarget = () => {
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";

    if (!redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/auth")) {
      return "/";
    }

    return redirect;
  };

  // 2. Form state
  const form = reactive({
    email: "",
    password: "",
  });

  // 3. Submission state
  const pending = ref(false);
  const errorMessage = ref("");
  const attempted = ref(false);

  // 4. Computed / derived state
  const sessionExpiredMessage = computed(() =>
    route.query.reason === "session-expired"
      ? session.lastError.value || "Your access for this workspace has changed. Please sign in again."
      : "",
  );

  const emailError = computed(() => {
    if (!attempted.value) return "";
    if (!form.email.trim()) return "Enter the admin email tied to this workspace.";
    return "";
  });

  const passwordError = computed(() => {
    if (!attempted.value) return "";
    if (!form.password.trim()) return "Enter the current password for this account.";
    return "";
  });

  // 5. Actions
  const submit = async () => {
    attempted.value = true;
    if (emailError.value || passwordError.value) {
      errorMessage.value = "Check the highlighted fields and try again.";
      return;
    }

    pending.value = true;
    errorMessage.value = "";
    session.clear();

    try {
      await session.adminLogin({
        email: form.email,
        password: form.password,
      });

      await navigateTo(resolveRedirectTarget());
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to sign in with the current credentials.");
    } finally {
      pending.value = false;
    }
  };

  // 6. Return statement
  return {
    form,
    pending,
    errorMessage,
    sessionExpiredMessage,
    emailError,
    passwordError,
    submit,
  };
};

export type AuthLoginPageState = Awaited<ReturnType<typeof useLoginPage>>;
