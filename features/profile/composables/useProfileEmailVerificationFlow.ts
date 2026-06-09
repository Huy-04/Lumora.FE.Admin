import type { UserResponse } from "~/features/users/types";

type VerificationStep = "idle" | "verify" | "done";

export const useProfileEmailVerificationFlow = (
  props: {
    open: boolean;
    user: UserResponse;
  },
  onClose: () => void,
  onUpdated: () => void,
) => {
  const authApi = useAuthApi();
  const otpCooldown = useOtpResendCooldown();

  const createOtpCode = () => Array.from({ length: 6 }, () => "");

  const verificationStep = ref<VerificationStep>("idle");
  const verificationPending = ref(false);
  const verificationSubmitPending = ref(false);
  const verificationError = ref("");
  const verificationSuccess = ref("");
  const verificationOtp = ref<string[]>(createOtpCode());

  const verificationOtpValue = computed(() => verificationOtp.value.join("").trim());
  const remainingSeconds = computed(() => otpCooldown.getRemainingSeconds(props.user.id));
  const verificationHelper = computed(() =>
    remainingSeconds.value > 0
      ? `You can request another code in ${remainingSeconds.value} seconds.`
      : "Enter the latest code from your inbox, or request a new one below.",
  );

  const resetVerification = () => {
    verificationStep.value = "idle";
    verificationError.value = "";
    verificationSuccess.value = "";
    verificationOtp.value = createOtpCode();
  };

  const closeDialog = () => {
    resetVerification();
    onClose();
  };

  const startVerification = async () => {
    verificationError.value = "";
    verificationSuccess.value = "";

    if (remainingSeconds.value > 0) {
      verificationStep.value = "verify";
      return;
    }

    verificationPending.value = true;

    try {
      await authApi.resendEmailOtp();
      otpCooldown.startCooldown(props.user.id);
      verificationStep.value = "verify";
      verificationSuccess.value = "A verification code has been sent to your email.";
    } catch (requestError) {
      otpCooldown.syncFromError(props.user.id, requestError);
      verificationError.value = getProblemMessage(requestError, "Unable to send the email verification code.");
    } finally {
      verificationPending.value = false;
    }
  };

  const resendVerification = async () => {
    verificationPending.value = true;
    verificationError.value = "";
    verificationSuccess.value = "";

    try {
      await authApi.resendEmailOtp();
      otpCooldown.startCooldown(props.user.id);
      verificationOtp.value = createOtpCode();
      verificationSuccess.value = "A new verification code has been sent to your email.";
    } catch (requestError) {
      otpCooldown.syncFromError(props.user.id, requestError);
      verificationError.value = getProblemMessage(requestError, "Unable to send another verification code.");
    } finally {
      verificationPending.value = false;
    }
  };

  const submitVerification = async () => {
    verificationSubmitPending.value = true;
    verificationError.value = "";
    verificationSuccess.value = "";

    try {
      await authApi.verifyEmailOtp({ otp: verificationOtpValue.value });
      verificationOtp.value = createOtpCode();
      verificationStep.value = "done";
      verificationSuccess.value = "Email verified successfully.";
      onUpdated();
    } catch (requestError) {
      verificationError.value = getProblemMessage(requestError, "Unable to verify the email code.");
    } finally {
      verificationSubmitPending.value = false;
    }
  };

  watch(
    () => props.user.emailStatus,
    (emailStatus) => {
      if (emailStatus === "Verified") {
        verificationStep.value = "done";
      }
    },
  );

  watch(
    () => props.open,
    (open) => {
      if (!open) {
        resetVerification();
      }
    },
  );

  return {
    closeDialog,
    remainingSeconds,
    resendVerification,
    startVerification,
    submitVerification,
    verificationError,
    verificationHelper,
    verificationOtp,
    verificationPending,
    verificationStep,
    verificationSubmitPending,
    verificationSuccess,
  };
};
