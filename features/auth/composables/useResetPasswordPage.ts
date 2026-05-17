export const useResetPasswordPage = async () => {
  // 1. Dependency injection
  const authApi = useAuthApi();
  const route = useRoute();
  const createEmptyOtp = () => Array.from({ length: 6 }, () => "");
  const otpCooldown = useOtpResendCooldown();

  type ResetStep = "request" | "verify" | "complete" | "done";

  // 2. Form state
  const form = reactive({
    email: "",
    resetCode: createEmptyOtp(),
    newPassword: "",
    resetToken: "",
  });

  // 3. Submission state
  const step = ref<ResetStep>("request");
  const pending = ref(false);
  const resendPending = ref(false);
  const successMessage = ref("");
  const errorMessage = ref("");
  const attempted = ref(false);

  // 4. Computed / derived state
  const resetCodeValue = computed(() => form.resetCode.join("").trim());
  const prefilledEmail = computed(() => typeof route.query.email === "string" ? route.query.email : "");

  const resendRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(form.email.trim()));
  const resendLabel = computed(() => resendRemainingSeconds.value > 0 ? `Resend code (${resendRemainingSeconds.value}s)` : "Resend code");
  const resendHelper = computed(() =>
    resendRemainingSeconds.value > 0
      ? `You can request another code in ${resendRemainingSeconds.value} seconds.`
      : `You can request a new code every ${otpCooldown.defaultCooldownSeconds} seconds.`,
  );

  const newPasswordRef = computed(() => form.newPassword);
  const { rules: passwordRules } = usePasswordRules(newPasswordRef);

  watch(
    prefilledEmail,
    (email) => {
      if (!email) return;
      form.email = email;
      step.value = "verify";
      otpCooldown.startCooldown(email);
    },
    { immediate: true, once: true },
  );

  const emailError = computed(() => {
    if (!attempted.value) return "";
    if (!form.email.trim()) return "Enter your account email.";
    return "";
  });

  const resetCodeError = computed(() => {
    if (!attempted.value || step.value !== "verify") return "";
    if (resetCodeValue.value.length !== 6) return "Enter the 6-character reset code.";
    return "";
  });

  const passwordError = computed(() => {
    if (!attempted.value || step.value !== "complete") return "";
    if (!form.newPassword.trim()) return "Enter a new password.";
    return "";
  });

  // 5. Actions

  /* ── Step 1: Request reset code ── */

  const requestCode = async () => {
    attempted.value = true;
    if (emailError.value) {
      errorMessage.value = "Enter your email to continue.";
      return;
    }

    pending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      await authApi.requestPasswordReset({ email: form.email.trim() });
      otpCooldown.startCooldown(form.email.trim());
      step.value = "verify";
      attempted.value = false;
      successMessage.value = "A reset code has been sent if the account exists.";
    } catch (error) {
      otpCooldown.syncFromError(form.email.trim(), error);
      errorMessage.value = getProblemMessage(error, "Unable to send the reset code.");
    } finally {
      pending.value = false;
    }
  };

  /* ── Step 2: Verify reset code ── */

  const verifyCode = async () => {
    attempted.value = true;
    if (resetCodeError.value) {
      errorMessage.value = "Enter the 6-character reset code.";
      return;
    }

    pending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      const result = await authApi.verifyPasswordResetOtp({
        email: form.email.trim(),
        resetCode: resetCodeValue.value,
      });

      form.resetToken = result.resetToken;
      step.value = "complete";
      attempted.value = false;
      successMessage.value = "Code verified. You can now choose a new password.";
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to verify the reset code.");
    } finally {
      pending.value = false;
    }
  };

  /* ── Step 3: Complete reset ── */

  const completeReset = async () => {
    attempted.value = true;
    if (passwordError.value) {
      errorMessage.value = "Enter a new password and try again.";
      return;
    }

    pending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      await authApi.completePasswordReset({
        resetToken: form.resetToken,
        newPassword: form.newPassword,
      });
      step.value = "done";
      form.newPassword = "";
      form.resetToken = "";
      form.resetCode = createEmptyOtp();
      attempted.value = false;
      successMessage.value = "Password updated. You can now sign in with the new credentials.";
    } catch (error) {
      errorMessage.value = getProblemMessage(error, "Unable to complete the password reset.");
    } finally {
      pending.value = false;
    }
  };

  /* ── Resend code ── */

  const resend = async () => {
    if (resendRemainingSeconds.value > 0) return;
    if (!form.email.trim()) {
      errorMessage.value = "Enter your email to send another code.";
      return;
    }

    resendPending.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    try {
      await authApi.resendPasswordResetOtp({ email: form.email.trim() });
      otpCooldown.startCooldown(form.email.trim());
      form.resetCode = createEmptyOtp();
      form.resetToken = "";
      successMessage.value = "A new reset code has been sent if the account exists.";
    } catch (error) {
      otpCooldown.syncFromError(form.email.trim(), error);
      errorMessage.value = getProblemMessage(error, "Unable to send another reset code.");
    } finally {
      resendPending.value = false;
    }
  };

  // 6. Return statement
  return {
    form,
    step,
    pending,
    resendPending,
    successMessage,
    errorMessage,
    emailError,
    resetCodeError,
    passwordError,
    passwordRules,
    resendHelper,
    resendRemainingSeconds,
    resendLabel,
    requestCode,
    verifyCode,
    completeReset,
    resend,
  };
};

export type AuthResetPasswordPageState = Awaited<ReturnType<typeof useResetPasswordPage>>;
