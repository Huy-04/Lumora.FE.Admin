import type { UserResponse } from "~/features/users/types/users";

type EmailStep = "idle" | "verify-current" | "enter-new" | "confirm-new" | "done";

export const useProfileEmailChangeFlow = (
  props: {
    open: boolean;
    user: UserResponse;
  },
  onClose: () => void,
) => {
  const authApi = useProfileApi();
  const authSession = useAuthSession();
  const otpCooldown = useOtpResendCooldown();

  const createOtpCode = () => Array.from({ length: 6 }, () => "");
  const currentEmailCooldownKey = computed(() => `${props.user.id}:change-email:current`);
  const newEmailCooldownKey = computed(() => `${props.user.id}:change-email:new`);

  const emailStep = ref<EmailStep>("idle");
  const emailPending = ref(false);
  const emailError = ref("");
  const currentOtp = ref<string[]>(createOtpCode());
  const newEmail = ref("");
  const newOtp = ref<string[]>(createOtpCode());

  const currentOtpValue = computed(() => currentOtp.value.join("").trim());
  const newOtpValue = computed(() => newOtp.value.join("").trim());
  const currentVerificationRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(currentEmailCooldownKey.value));
  const newVerificationRemainingSeconds = computed(() => otpCooldown.getRemainingSeconds(newEmailCooldownKey.value));

  const emailFlowDescription = computed(() => {
    switch (emailStep.value) {
      case "verify-current":
        return "Enter the code from your current email.";
      case "enter-new":
        return "Enter the email you want to use.";
      case "confirm-new":
        return `Enter the code sent to ${newEmail.value || "the new email"}.`;
      case "done":
        return "Email updated successfully.";
      default:
        return "Confirm both inboxes before switching.";
    }
  });

  const currentVerificationHelper = computed(() =>
    currentVerificationRemainingSeconds.value > 0
      ? `You can request another code in ${currentVerificationRemainingSeconds.value} seconds.`
      : "Enter the latest code from your current inbox, or request a new one below.",
  );

  const newVerificationHelper = computed(() =>
    newVerificationRemainingSeconds.value > 0
      ? `You can request another code in ${newVerificationRemainingSeconds.value} seconds.`
      : "Enter the latest code from your new inbox, or request a new one below.",
  );

  const resetEmailFlow = () => {
    emailStep.value = "idle";
    emailError.value = "";
    currentOtp.value = createOtpCode();
    newEmail.value = "";
    newOtp.value = createOtpCode();
  };

  const closeDialog = () => {
    resetEmailFlow();
    onClose();
  };

  const requestCurrentVerification = async () => {
    if (currentVerificationRemainingSeconds.value > 0) {
      emailStep.value = "verify-current";
      return;
    }

    emailPending.value = true;
    emailError.value = "";

    try {
      currentOtp.value = createOtpCode();
      newEmail.value = "";
      newOtp.value = createOtpCode();
      await authApi.requestCurrentEmailVerification();
      otpCooldown.startCooldown(currentEmailCooldownKey.value);
      emailStep.value = "verify-current";
    } catch (requestError) {
      otpCooldown.syncFromError(currentEmailCooldownKey.value, requestError);
      emailError.value = getProblemMessage(requestError, "Unable to send verification to current email.");
    } finally {
      emailPending.value = false;
    }
  };

  const resendCurrentVerification = async () => {
    if (currentVerificationRemainingSeconds.value > 0) {
      return;
    }

    emailPending.value = true;
    emailError.value = "";

    try {
      currentOtp.value = createOtpCode();
      await authApi.resendCurrentEmailVerification();
      otpCooldown.startCooldown(currentEmailCooldownKey.value);
    } catch (requestError) {
      otpCooldown.syncFromError(currentEmailCooldownKey.value, requestError);
      emailError.value = getProblemMessage(requestError, "Unable to send another code to the current email.");
    } finally {
      emailPending.value = false;
    }
  };

  const confirmCurrentVerification = async () => {
    emailPending.value = true;
    emailError.value = "";

    try {
      await authApi.confirmCurrentEmailVerification({ token: currentOtpValue.value });
      currentOtp.value = createOtpCode();
      emailStep.value = "enter-new";
    } catch (requestError) {
      emailError.value = getProblemMessage(requestError, "Current email verification failed.");
    } finally {
      emailPending.value = false;
    }
  };

  const requestNewEmailVerification = async () => {
    if (newVerificationRemainingSeconds.value > 0) {
      emailStep.value = "confirm-new";
      return;
    }

    emailPending.value = true;
    emailError.value = "";

    try {
      newEmail.value = newEmail.value.trim();
      await authApi.requestNewEmailVerification({ newEmail: newEmail.value });
      otpCooldown.startCooldown(newEmailCooldownKey.value);
      newOtp.value = createOtpCode();
      emailStep.value = "confirm-new";
    } catch (requestError) {
      otpCooldown.syncFromError(newEmailCooldownKey.value, requestError);
      emailError.value = getProblemMessage(requestError, "Unable to send verification to new email.");
    } finally {
      emailPending.value = false;
    }
  };

  const resendNewEmailVerification = async () => {
    if (newVerificationRemainingSeconds.value > 0) {
      return;
    }

    emailPending.value = true;
    emailError.value = "";

    try {
      newEmail.value = newEmail.value.trim();
      await authApi.resendNewEmailVerification();
      otpCooldown.startCooldown(newEmailCooldownKey.value);
      newOtp.value = createOtpCode();
      emailStep.value = "confirm-new";
    } catch (requestError) {
      otpCooldown.syncFromError(newEmailCooldownKey.value, requestError);
      emailError.value = getProblemMessage(requestError, "Unable to send another code to the new email.");
    } finally {
      emailPending.value = false;
    }
  };

  const completeEmailChange = async () => {
    emailPending.value = true;
    emailError.value = "";

    try {
      await authApi.completeEmailChange({ token: newOtpValue.value });
      newOtp.value = createOtpCode();
      emailStep.value = "done";
      // Backend revokes the current session immediately after the change succeeds.
      authSession.clear();
      setTimeout(() => {
        navigateTo({
          path: "/auth/login",
          query: { reason: "security-updated" },
        });
      }, 3000);
    } catch (requestError) {
      emailError.value = getProblemMessage(requestError, "New email verification failed.");
    } finally {
      emailPending.value = false;
    }
  };

  watch(
    () => props.user.email,
    () => {
      if (emailStep.value === "done") {
        resetEmailFlow();
      }
    },
  );

  return {
    closeDialog,
    completeEmailChange,
    confirmCurrentVerification,
    currentOtp,
    currentVerificationHelper,
    currentVerificationRemainingSeconds,
    emailError,
    emailFlowDescription,
    emailPending,
    emailStep,
    newEmail,
    newOtp,
    newVerificationHelper,
    newVerificationRemainingSeconds,
    requestCurrentVerification,
    requestNewEmailVerification,
    resendCurrentVerification,
    resendNewEmailVerification,
  };
};
