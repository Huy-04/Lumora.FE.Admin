import type { UserResponse } from "~/features/users/types";

type VerificationStep = "idle" | "verify" | "done";

export const useProfilePhoneVerificationFlow = (
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

  const verificationCooldownKey = computed(() => `phone-verification:${props.user.id}`);
  const verificationStep = ref<VerificationStep>("idle");
  const verificationPending = ref(false);
  const verificationSubmitPending = ref(false);
  const verificationError = ref("");
  const verificationSuccess = ref("");
  const verificationOtp = ref<string[]>(createOtpCode());

  const verificationOtpValue = computed(() => verificationOtp.value.join("").trim());
  const remainingSeconds = computed(() => otpCooldown.getRemainingSeconds(verificationCooldownKey.value));
  const verificationHelper = computed(() =>
    remainingSeconds.value > 0
      ? `You can request another code in ${remainingSeconds.value} seconds.`
      : "Enter the latest SMS code, or request a new one below.",
  );

  const resetVerification = () => {
    verificationStep.value = props.user.phoneStatus === "Verified" ? "done" : "idle";
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
      await authApi.resendPhoneOtp();
      otpCooldown.startCooldown(verificationCooldownKey.value);
      verificationStep.value = "verify";
      verificationSuccess.value = "A verification code has been sent to your phone.";
    } catch (requestError) {
      otpCooldown.syncFromError(verificationCooldownKey.value, requestError);
      verificationError.value = getProblemMessage(requestError, "Unable to send the phone verification code.");
    } finally {
      verificationPending.value = false;
    }
  };

  const resendVerification = async () => {
    verificationPending.value = true;
    verificationError.value = "";
    verificationSuccess.value = "";

    try {
      await authApi.resendPhoneOtp();
      otpCooldown.startCooldown(verificationCooldownKey.value);
      verificationOtp.value = createOtpCode();
      verificationSuccess.value = "A new verification code has been sent to your phone.";
    } catch (requestError) {
      otpCooldown.syncFromError(verificationCooldownKey.value, requestError);
      verificationError.value = getProblemMessage(requestError, "Unable to send another phone verification code.");
    } finally {
      verificationPending.value = false;
    }
  };

  const submitVerification = async () => {
    verificationSubmitPending.value = true;
    verificationError.value = "";
    verificationSuccess.value = "";

    try {
      await authApi.verifyPhoneOtp({ otp: verificationOtpValue.value });
      verificationOtp.value = createOtpCode();
      verificationStep.value = "done";
      verificationSuccess.value = "Phone verified successfully.";
      onUpdated();
    } catch (requestError) {
      verificationError.value = getProblemMessage(requestError, "Unable to verify the phone code.");
    } finally {
      verificationSubmitPending.value = false;
    }
  };

  watch(
    () => props.user.phoneStatus,
    (phoneStatus) => {
      if (phoneStatus === "Verified") {
        verificationStep.value = "done";
      }
    },
  );

  watch(
    () => props.open,
    (open) => {
      if (!open) {
        resetVerification();
        return;
      }

      verificationStep.value = props.user.phoneStatus === "Verified" ? "done" : "idle";
    },
    { immediate: true },
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
